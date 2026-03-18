
// import React, { useState, useEffect, useRef } from 'react';
// import './client.css';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useProfile } from '../context/ProfileContext';
// const ClientLenden = () => {
//     const [selectedClient, setSelectedClient] = useState('');
//     const [selectedCollection, setSelectedCollection] = useState('');
//     const [selectedDate, setSelectedDate] = useState('');
//     const [amount, setAmount] = useState('');
//     const [paymentType, setPaymentType] = useState('');
//     const [remark, setRemark] = useState('');
//     const [showCalendar, setShowCalendar] = useState(false);
//     const [showClientDropdown, setShowClientDropdown] = useState(false);
//     const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
//     const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
//     const [clientSearchTerm, setClientSearchTerm] = useState('');
//     const [filteredClients, setFilteredClients] = useState([]);
//     const paymentDropdownRef = useRef(null);
//     const collectionDropdownRef = useRef(null);
//     const navigate = useNavigate();
//     const { profile } = useProfile();
//     const agentId = profile.AgentNo;
//     const [clients, setClients] = useState([]);
//     const [allLedgerData, setAllLedgerData] = useState([]);
//     const [selectedSuperAgentLedger, setSelectedSuperAgentLedger] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [sampleClients, setSampleClients] = useState([]);
//     const fetchClients = async () => {
//         setLoading(true);
//         try {
//           const storedAgent = JSON.parse(localStorage.getItem('agent'));
//           if (!storedAgent || !storedAgent.id) {
//             console.error('No agent data found in localStorage');
//             setLoading(false);
//             return;
//           }
    
//           const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getAllsubUser/${storedAgent.id}`);
         
    
//           if (response.data && Array.isArray(response.data)) {
//             // Filter by role 'agent' in frontend
//             const agentUsers = response.data.filter(client => client.role === 'agent');
            
//             const formattedClients = agentUsers.map((client, index) => ({
//               id: client._id || index + 1,
//               _id: client._id,
//               userId: client._id, // Store userId for ledger matching
//               code: client.userNo || client.AgentNo || 'N/A',
//               agentNo: client.AgentNo || client.userNo || 'N/A', // Store AgentNo for display
//               name: client.email || client.name || 'N/A',
//               agent: client.agent || storedAgent.AgentNo,
//               contact: client.username || client.contact || 'N/A',
//               phoneNumber: client.phoneNumber || client.contact || client.username || '',
//               doj: client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-GB') : 'N/A',
//               pwd: client.pwd,
//               exposure: `₹${(client.wallet?.exposureBalance || 0) + (client.wallet?.sessionexposure || 0)}`,
//               type: client.commType || 'N/A',
//               mat: client.matchComm || 'N/A',
//               ses: client.sessComm || 'N/A',
//               chips: `₹${client.wallet?.balance || client.balance || 0}`,
//               status: 'Active',
//               originalData: client,
//               isActive: client.isActive
//             }));
    
         
//             setSampleClients(formattedClients);
//             setClients(formattedClients);
//             setFilteredClients(formattedClients);
//           } else {
//             console.error('Invalid response format:', response.data);
//             setSampleClients([]);
//             setClients([]);
//             setFilteredClients([]);
//           }
//         } catch (error) {
//           console.error('Error fetching clients:', error);
//           setSampleClients([]);
//           setClients([]);
//           setFilteredClients([]);
//         } finally {
//           setLoading(false);
//         }
//       };
    
//     // Extract fetch function to be reusable
//     const fetchClientLedger = async () => {
//         const storedAgent = JSON.parse(localStorage.getItem('agent'));
//         if (!storedAgent?.id) return;

//         try {
//             const res = await axios.get(
//                 `${process.env.REACT_APP_BASE_URL}/api/getledgerstement/${storedAgent.id}`
//             );

//             const data = res.data.data || [];
//             console.log("agent ledger data", data);

//             // Store all ledger data only - don't update clients here
//             setAllLedgerData(data);

//         } catch (error) {
//             console.error('Error fetching ledger:', error);
//         }
//     };

//     useEffect(() => {
//         fetchClients();
//         if (agentId) fetchClientLedger();
//     }, [agentId]);

//     // Update ledger entries when agent is selected
//     useEffect(() => {
//         if (selectedClient && allLedgerData.length > 0) {
//             // Find the selected client to get userId and _id
//             const selectedClientObj = clients.find(c => c.id === selectedClient || c._id === selectedClient);
            
//             if (selectedClientObj) {
//                 // Filter ledger entries matching userId and _id
//                 const filteredLedger = allLedgerData
//                     .filter(item => 
//                         (item.userId === selectedClientObj.userId || item.userId === selectedClientObj._id) && 
//                         item.role === 'agent'
//                     )
//                     .map(item => ({
//                         date: new Date(item.createdAt).toLocaleString('en-GB', {
//                             day: '2-digit',
//                             month: 'short',
//                             hour: '2-digit',
//                             minute: '2-digit',
//                             hour12: true,
//                         }),
//                         credit: item.type === 'CREDIT' ? parseFloat(item.amount || 0) : 0,
//                         debit: item.type === 'DEBIT' ? parseFloat(item.amount || 0) : 0,
//                         balance: parseFloat(item.closeBal || 0),
//                         remark: item.remark || '',
//                         matchComm: parseFloat(item.matchComm || 0),
//                         partnership: parseFloat(item.partnership || 0),
//                         matchname: item.matchname || '',
//                         txnType: item.txnType || '',
//                         event: item.event || '',
//                         createdAt: item.createdAt
//                     }))
//                     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by date descending

//                 setSelectedSuperAgentLedger(filteredLedger);
//             } else {
//                 setSelectedSuperAgentLedger([]);
//             }
//         } else {
//             setSelectedSuperAgentLedger([]);
//         }
//     }, [selectedClient, allLedgerData, clients]);

//     // Payment type options
//     const paymentOptions = [
//         { value: 'PAYMENT-DIYA', label: 'PAYMENT-DIYA' },
//         { value: 'PAYMENT-LIYA', label: 'PAYMENT-LIYA' }
//     ];

//     // Collection options
//     const collectionOptions = [
//         { value: 'CASH A/C', label: 'CASH A/C' },
//         { value: 'BANK A/C', label: 'BANK A/C' }
//     ];


//     // Filter clients based on search term (search by AgentNo or name)
//     useEffect(() => {
//         if (showClientDropdown) {
//             const filtered = clients.filter(client =>
//                 client.agentNo.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
//                 client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
//             );
//             setFilteredClients(filtered);
//         }
//     }, [clientSearchTerm, showClientDropdown, clients]);

//     // Initialize filtered clients when dropdown opens
//     useEffect(() => {
//         if (showClientDropdown) {
//             setFilteredClients(clients);
//         }
//     }, [showClientDropdown, clients]);

//     // Close dropdowns when clicking outside
//     useEffect(() => {
//         function handleClickOutside(event) {
//             if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target)) {
//                 setShowPaymentDropdown(false);
//             }
//             if (collectionDropdownRef.current && !collectionDropdownRef.current.contains(event.target)) {
//                 setShowCollectionDropdown(false);
//             }
//         }
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);

//     // Function to handle date selection
//     const handleDateChange = (e) => {
//         setSelectedDate(e.target.value);
//         setShowCalendar(false);
//     };

//     // Toggle calendar visibility
//     const toggleCalendar = () => {
//         setShowCalendar(!showCalendar);
//     };

//     // Toggle payment type dropdown
//     const togglePaymentDropdown = () => {
//         setShowPaymentDropdown(!showPaymentDropdown);
//     };

//     // Toggle collection dropdown
//     const toggleCollectionDropdown = () => {
//         setShowCollectionDropdown(!showCollectionDropdown);
//     };

//     // Handle payment type selection
//     const handlePaymentSelect = (value, label) => {
//         setPaymentType(value);
//         setShowPaymentDropdown(false);
//     };

//     // Handle collection selection
//     const handleCollectionSelect = (value, label) => {
//         setSelectedCollection(value);
//         setShowCollectionDropdown(false);
//     };

//     // Handle client selection
//     const handleClientSelect = (clientId, displayText) => {
//         setSelectedClient(clientId);
//         setClientSearchTerm(displayText);
//         setShowClientDropdown(false);
//     };

//     // Toggle client dropdown
//     const toggleClientDropdown = () => {
//         setShowClientDropdown(!showClientDropdown);
//     };

//     // Handle client search input
//     const handleClientSearch = (e) => {
//         setClientSearchTerm(e.target.value);
//         if (!showClientDropdown) {
//             setShowClientDropdown(true);
//         }
//     };

//     // Handle form submit
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // Validation
//         if (
//             !selectedClient.trim() ||
//             !selectedCollection.trim() ||
//             !selectedDate.trim() ||
//             !amount.trim() ||
//             !paymentType.trim() ||
//             !remark.trim()
//         ) {
//             alert('Please fill in all required fields.');
//             return;
//         }

//         const clientObj = clients.find(c => c.id === selectedClient || c._id === selectedClient);
//         if (!clientObj) {
//             alert('Selected client not found.');
//             return;
//         }

//         // Use userId (_id) for form submission
//         const clientId = clientObj.userId || clientObj._id;
//         const clientName = clientObj.name || clientObj.agentNo || '';

//         const formData = {
//             clientId: clientId, // Send the actual userId/_id
//             clientName,
//             collection: selectedCollection,
//             date: selectedDate,
//             amount,
//             paymentType,
//             remark,
//         };
//         console.log(formData, "form data");
//         try {
//             const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/update/ledgerstatement`, formData);
//             alert('Data submitted successfully');
//             console.log('Server Response:', res.data);
            
//             // Store selected client to restore after refetch
//             const currentSelectedClient = selectedClient;
//             const currentClientName = clientSearchTerm;
            
//             // Clear form fields
//             setSelectedCollection('');
//             setSelectedDate('');
//             setAmount('');
//             setPaymentType('');
//             setRemark('');
            
//             // Refetch ledger data immediately after successful POST
//             await fetchClientLedger();
            
//             // Restore selected client if it was selected
//             if (currentSelectedClient) {
//                 setSelectedClient(currentSelectedClient);
//                 setClientSearchTerm(currentClientName);
//             } else {
//                 setSelectedClient('');
//                 setClientSearchTerm('');
//             }
//         } catch (err) {
//             console.error('Error submitting data:', err);
//             alert('Failed to submit data');
//         }
//     };

//     // Calculate totals for the selected superagent
//     let totalDena = 0;
//     let totalLena = 0;
//     let balance = 0;

//     if (selectedSuperAgentLedger.length > 0) {
//         totalDena = selectedSuperAgentLedger.reduce((sum, row) => sum + row.debit, 0);
//         totalLena = selectedSuperAgentLedger.reduce((sum, row) => sum + row.credit, 0);
//         balance = totalLena - totalDena;
//     }

//     return (
//         <div className="client-lenden-container">
//             <div className="header">
//                 <div className="title">Agent Transactions</div>
//                 <button className="back-btn" onClick={() => navigate('/')}>Back</button>
//             </div>

//             <div className="form-container">
//                 <form className="form-container" onSubmit={handleSubmit}>
//                     <div className="form-row">
//                         <div className="form-group">
//                             <label><span className="required">*</span> Agent</label>
//                             <div className="client-select-wrapper">
//                                 <div className="client-input">
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         value={clientSearchTerm}
//                                         onChange={handleClientSearch}
//                                         placeholder="Select Agent"
//                                         onClick={() => setShowClientDropdown(true)}
//                                     />
//                                     <span className="dropdown-arrow" onClick={toggleClientDropdown}>▼</span>
//                                 </div>

//                                 {showClientDropdown && (
//                                     <div className="client-dropdown">
//                                         {filteredClients.length > 0 ? (
//                                             filteredClients.map(client => (
//                                                 <div
//                                                     key={client.id}
//                                                     className="client-option"
//                                                     onClick={() => handleClientSelect(client.id, client.agentNo)}
//                                                 >
//                                                     A{client.agentNo}
//                                                 </div>
//                                             ))
//                                         ) : (
//                                             <div className="no-data">
//                                                 <div className="no-data-icon">
//                                                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//                                                         <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
//                                                     </svg>
//                                                 </div>
//                                                 <div className="no-data-text">No Data</div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         <div className="form-group" ref={collectionDropdownRef}>
//                             <label><span className="required">*</span> Collection</label>
//                             <div className="select-wrapper">
//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     value={selectedCollection}
//                                     readOnly
//                                     onClick={toggleCollectionDropdown}
//                                     placeholder="Select collection"
//                                 />
//                                 {showCollectionDropdown && (
//                                     <div className="payment-dropdown">
//                                         <div className="payment-dropdown-header">
//                                             CASH A/C
//                                         </div>
//                                         {collectionOptions.map((option, index) => (
//                                             <div
//                                                 key={index}
//                                                 className="payment-option"
//                                                 onClick={() => handleCollectionSelect(option.value, option.label)}
//                                             >
//                                                 {option.label}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         <div className="form-group">
//                             <label><span className="required">*</span> Date</label>
//                             <div className="date-wrapper">
//                                 <input
//                                     type="text"
//                                     value={selectedDate}
//                                     readOnly
//                                     onClick={toggleCalendar}
//                                     placeholder="Select date"
//                                     className="form-control date-input"
//                                 />
//                                 {showCalendar && (
//                                     <div className="calendar-dropdown">
//                                         <input
//                                             type="date"
//                                             onChange={handleDateChange}
//                                             className="calendar-date-picker"
//                                         />
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label><span className="required">*</span> Amount</label>
//                             <input
//                                 type="text"
//                                 value={amount}
//                                 onChange={(e) => setAmount(e.target.value)}
//                                 placeholder="Enter amount"
//                                 className="form-control"
//                             />
//                         </div>

//                         <div className="form-group" ref={paymentDropdownRef}>
//                             <label><span className="required">*</span> Payment Type</label>
//                             <div className="select-wrapper">
//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     value={paymentType}
//                                     placeholder="Select Payment Type"
//                                     readOnly
//                                     onClick={togglePaymentDropdown}
//                                 />
//                                 {showPaymentDropdown && (
//                                     <div className="payment-dropdown">
//                                         <div className="payment-dropdown-header">
//                                             Select Payment Type
//                                         </div>
//                                         {paymentOptions.map((option, index) => (
//                                             <div
//                                                 key={index}
//                                                 className="payment-option"
//                                                 onClick={() => handlePaymentSelect(option.value, option.label)}
//                                             >
//                                                 {option.label}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         <div className="form-group">
//                             <label><span className="required">*</span> Remark</label>
//                             <input
//                                 type="text"
//                                 value={remark}
//                                 onChange={(e) => setRemark(e.target.value)}
//                                 placeholder="Remarks"
//                                 className="form-control"
//                             />
//                         </div>
//                     </div>

//                     <div className="button-container">
//                         <button className="submit-btn" type="submit">Submit</button>
//                     </div>
//                 </form>
//             </div>

//             <div className="bottom-border"></div>

//             {/* Ledger Statement Table for Selected Superagent */}
//             {selectedClient && (
//                 <div className="client-table-container">
//                     {selectedSuperAgentLedger.length > 0 ? (
//                         <>
//                             <div className="client-table-summary" style={{
//                                 display: 'flex',
//                                 justifyContent: 'space-between',
//                                 alignItems: 'center',
//                                 padding: '15px 20px',
//                                 marginBottom: '10px'
//                             }}>
//                                 <span style={{ color: 'red', fontWeight: 'bold', fontSize: '22px', flex: '1', textAlign: 'center' }}>
//                                     Dena: {totalDena.toFixed(2)}
//                                 </span>
//                                 <span style={{ color: 'green', fontWeight: 'bold', fontSize: '22px', flex: '1', textAlign: 'center' }}>
//                                     Lena: {totalLena.toFixed(2)}
//                                 </span>
//                                 <span style={{ color: balance >= 0 ? 'green' : 'red', fontWeight: 'bold', fontSize: '22px', flex: '1', textAlign: 'center' }}>
//                                     Balance: {balance.toFixed(2)} {balance >= 0 ? '(Lena)' : '(Dena)'}
//                                 </span>
//                             </div>
//                             <table className="client-table">
//                                 <thead>
//                                     <tr>
//                                         <th style={{ width: '80px', minWidth: '80px' }}>Sr.No</th>
//                                         <th>Match Name</th>
//                                         <th>Event</th>
//                                         <th>Debit</th>
//                                         <th>Credit</th>
//                                         <th>Balance</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {selectedSuperAgentLedger.map((row, idx) => (
//                                         <tr
//                                             key={idx}
//                                             style={{
//                                                 background: idx % 2 === 0 ? '#f8f9fa' : '#fff'
//                                             }}
//                                         >
//                                             <td style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}>{idx + 1}</td>
//                                             <td>{row.matchname || '-'}</td>
//                                             <td>{row.event}</td>
//                                             <td>{row.debit > 0 ? row.debit.toFixed(2) : '-'}</td>
//                                             <td>{row.credit > 0 ? row.credit.toFixed(2) : '-'}</td>
//                                             <td>{row.balance.toFixed(2)}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </>
//                     ) : (
//                         <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
//                             No ledger entries found for this agent.
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ClientLenden;







import React, { useState, useEffect, useMemo, useRef } from 'react';
import './client.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProfile } from '../context/ProfileContext';
const ClientLenden = () => {
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [remark, setRemark] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
    const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [filteredClients, setFilteredClients] = useState([]);
    const paymentDropdownRef = useRef(null);
    const collectionDropdownRef = useRef(null);
    const navigate = useNavigate();
    const { profile } = useProfile();
    const agentId = profile.AgentNo;
    const [clients, setClients] = useState([]);
    const [allLedgerData, setAllLedgerData] = useState([]);
    const [selectedSuperAgentLedger, setSelectedSuperAgentLedger] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sampleClients, setSampleClients] = useState([]);
    const fetchClients = async () => {
        setLoading(true);
        try {
          const storedAgent = JSON.parse(localStorage.getItem('agent'));
          if (!storedAgent || !storedAgent.id) {
            console.error('No agent data found in localStorage');
            setLoading(false);
            return;
          }
    
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getAllsubUser/${storedAgent.id}`);
         
    
          if (response.data && Array.isArray(response.data)) {
            // Filter by role 'agent' in frontend
            const agentUsers = response.data.filter(client => client.role === 'agent');
            
            const formattedClients = agentUsers.map((client, index) => ({
              id: client._id || index + 1,
              _id: client._id,
              userId: client._id, // Store userId for ledger matching
              code: client.userNo || client.AgentNo || 'N/A',
              agentNo: client.AgentNo || client.userNo || 'N/A', // Store AgentNo for display
              name: client.email || client.name || 'N/A',
              agent: client.agent || storedAgent.AgentNo,
              contact: client.username || client.contact || 'N/A',
              phoneNumber: client.phoneNumber || client.contact || client.username || '',
              doj: client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-GB') : 'N/A',
              pwd: client.pwd,
              exposure: `₹${(client.wallet?.exposureBalance || 0) + (client.wallet?.sessionexposure || 0)}`,
              type: client.commType || 'N/A',
              mat: client.matchComm || 'N/A',
              ses: client.sessComm || 'N/A',
              chips: `₹${client.wallet?.balance || client.balance || 0}`,
              status: 'Active',
              originalData: client,
              isActive: client.isActive
            }));
    
         
            setSampleClients(formattedClients);
            setClients(formattedClients);
            setFilteredClients(formattedClients);
          } else {
            console.error('Invalid response format:', response.data);
            setSampleClients([]);
            setClients([]);
            setFilteredClients([]);
          }
        } catch (error) {
          console.error('Error fetching clients:', error);
          setSampleClients([]);
          setClients([]);
          setFilteredClients([]);
        } finally {
          setLoading(false);
        }
      };
    
    // Extract fetch function to be reusable
    const fetchClientLedger = async () => {
        const storedAgent = JSON.parse(localStorage.getItem('agent'));
        if (!storedAgent?.id) return;

        try {
            const res = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/api/getledgerstement/${storedAgent.id}`
            );

            const data = res.data.data || [];
            console.log("agent ledger data", data);

            // Store all ledger data only - don't update clients here
            setAllLedgerData(data);

        } catch (error) {
            console.error('Error fetching ledger:', error);
        }
    };

    useEffect(() => {
        fetchClients();
        if (agentId) fetchClientLedger();
    }, [agentId]);

    // Update ledger entries when agent is selected
    useEffect(() => {
        if (selectedClient && allLedgerData.length > 0) {
            // Find the selected client to get userId and _id
            const selectedClientObj = clients.find(c => c.id === selectedClient || c._id === selectedClient);
            
            if (selectedClientObj) {
                // Filter ledger entries matching userId and _id
                const filteredLedger = allLedgerData
                    .filter(item => 
                        (item.userId === selectedClientObj.userId || item.userId === selectedClientObj._id) && 
                        item.role === 'agent'
                    )
                    .map(item => ({
                        date: new Date(item.createdAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        }),
                        credit: item.type === 'CREDIT' ? parseFloat(item.amount || 0) : 0,
                        debit: item.type === 'DEBIT' ? parseFloat(item.amount || 0) : 0,
                        balance: parseFloat(item.closeBal || 0),
                        remark: item.remark || '',
                        matchComm: parseFloat(item.matchComm || 0),
                        partnership: parseFloat(item.partnership || 0),
                        matchname: item.matchname || '',
                        txnType: item.txnType || '',
                        event: item.event || '',
                        createdAt: item.createdAt
                    }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by date descending

                setSelectedSuperAgentLedger(filteredLedger);
            } else {
                setSelectedSuperAgentLedger([]);
            }
        } else {
            setSelectedSuperAgentLedger([]);
        }
    }, [selectedClient, allLedgerData, clients]);

    // Payment type options
    const paymentOptions = [
        { value: 'PAYMENT-DIYA', label: 'PAYMENT-DIYA' },
        { value: 'PAYMENT-LIYA', label: 'PAYMENT-LIYA' }
    ];

    // Collection options
    const collectionOptions = [
        { value: 'CASH A/C', label: 'CASH A/C' },
        { value: 'BANK A/C', label: 'BANK A/C' }
    ];


    // Filter clients based on search term (search by AgentNo or name)
    useEffect(() => {
        if (showClientDropdown) {
            const filtered = clients.filter(client =>
                client.agentNo.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
            );
            setFilteredClients(filtered);
        }
    }, [clientSearchTerm, showClientDropdown, clients]);

    // Initialize filtered clients when dropdown opens
    useEffect(() => {
        if (showClientDropdown) {
            setFilteredClients(clients);
        }
    }, [showClientDropdown, clients]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target)) {
                setShowPaymentDropdown(false);
            }
            if (collectionDropdownRef.current && !collectionDropdownRef.current.contains(event.target)) {
                setShowCollectionDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Function to handle date selection
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        setShowCalendar(false);
    };

    // Toggle calendar visibility
    const toggleCalendar = () => {
        setShowCalendar(!showCalendar);
    };

    // Toggle payment type dropdown
    const togglePaymentDropdown = () => {
        setShowPaymentDropdown(!showPaymentDropdown);
    };

    // Toggle collection dropdown
    const toggleCollectionDropdown = () => {
        setShowCollectionDropdown(!showCollectionDropdown);
    };

    // Handle payment type selection
    const handlePaymentSelect = (value, label) => {
        setPaymentType(value);
        setShowPaymentDropdown(false);
    };

    // Handle collection selection
    const handleCollectionSelect = (value, label) => {
        setSelectedCollection(value);
        setShowCollectionDropdown(false);
    };

    // Handle client selection
    const handleClientSelect = (clientId, displayText) => {
        setSelectedClient(clientId);
        setClientSearchTerm(displayText);
        setShowClientDropdown(false);
    };

    // Toggle client dropdown
    const toggleClientDropdown = () => {
        setShowClientDropdown(!showClientDropdown);
    };

    // Handle client search input
    const handleClientSearch = (e) => {
        setClientSearchTerm(e.target.value);
        if (!showClientDropdown) {
            setShowClientDropdown(true);
        }
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (
            !selectedClient.trim() ||
            !selectedCollection.trim() ||
            !selectedDate.trim() ||
            !amount.trim() ||
            !paymentType.trim() ||
            !remark.trim()
        ) {
            alert('Please fill in all required fields.');
            return;
        }

        const clientObj = clients.find(c => c.id === selectedClient || c._id === selectedClient);
        if (!clientObj) {
            alert('Selected client not found.');
            return;
        }

        // Use userId (_id) for form submission
        const clientId = clientObj.userId || clientObj._id;
        const clientName = clientObj.name || clientObj.agentNo || '';

        const formData = {
            clientId: clientId, // Send the actual userId/_id
            clientName,
            collection: selectedCollection,
            date: selectedDate,
            amount,
            paymentType,
            remark,
        };
        console.log(formData, "form data");
        try {
            const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/update/ledgerstatement`, formData);
            alert('Data submitted successfully');
            console.log('Server Response:', res.data);
            
            // Store selected client to restore after refetch
            const currentSelectedClient = selectedClient;
            const currentClientName = clientSearchTerm;
            
            // Clear form fields
            setSelectedCollection('');
            setSelectedDate('');
            setAmount('');
            setPaymentType('');
            setRemark('');
            
            // Refetch ledger data immediately after successful POST
            await fetchClientLedger();
            
            // Restore selected client if it was selected
            if (currentSelectedClient) {
                setSelectedClient(currentSelectedClient);
                setClientSearchTerm(currentClientName);
            } else {
                setSelectedClient('');
                setClientSearchTerm('');
            }
        } catch (err) {
            console.error('Error submitting data:', err);
            alert('Failed to submit data');
        }
    };

    // Calculate grouped ledger (per match / passthrough rows)
    const displayLedger = useMemo(() => {
        if (!selectedSuperAgentLedger?.length) return [];

        const matchGroups = new Map();
        const passthrough = [];

        for (let i = 0; i < selectedSuperAgentLedger.length; i += 1) {
            const row = selectedSuperAgentLedger[i];
            const matchname = (row.matchname || '').trim();

            if (!matchname) {
                passthrough.push({ ...row, __key: row.createdAt || `row-${i}` });
                continue;
            }

            const key = matchname.toLowerCase();
            const existing = matchGroups.get(key);
            if (!existing) {
                matchGroups.set(key, {
                    matchname,
                    debit: row.debit || 0,
                    credit: row.credit || 0,
                    createdAt: row.createdAt,
                });
            } else {
                existing.debit += row.debit || 0;
                existing.credit += row.credit || 0;
                if (row.createdAt && (!existing.createdAt || new Date(row.createdAt) > new Date(existing.createdAt))) {
                    existing.createdAt = row.createdAt;
                }
            }
        }

        const groupedMatches = Array.from(matchGroups.values()).map((g) => ({
            ...g,
            event: 'Cricket',
            balance: (g.credit || 0) - (g.debit || 0),
            __key: `match-${g.matchname}`,
        }));

        return [...groupedMatches, ...passthrough].sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }, [selectedSuperAgentLedger]);

    // Show net in either Debit/Credit, and compute running closing balance bottom -> top
    const processedLedger = useMemo(() => {
        if (!displayLedger.length) return [];

        const rows = displayLedger.map((row) => {
            const net = (row.credit || 0) - (row.debit || 0);

            return {
                ...row,
                _net: net,
                _displayDebit: net < 0 ? Math.abs(net) : 0,
                _displayCredit: net > 0 ? net : 0,
                _runningBalance: 0,
            };
        });

        let runningBalance = 0;
        for (let i = rows.length - 1; i >= 0; i -= 1) {
            runningBalance += rows[i]._net || 0;
            rows[i]._runningBalance = runningBalance;
        }

        return rows;
    }, [displayLedger]);

    let totalDena = 0;
    let totalLena = 0;
    let balance = 0;

    // Keep top totals same as earlier (original debit/credit totals)
    if (displayLedger.length > 0) {
        totalDena = displayLedger.reduce((sum, row) => sum + (row.debit || 0), 0);
        totalLena = displayLedger.reduce((sum, row) => sum + (row.credit || 0), 0);
        balance = totalLena - totalDena;
    }

    return (
        <div className="client-lenden-container">
            <div className="header">
                <div className="title">Agent Transactions</div>
                <button className="back-btn" onClick={() => navigate('/')}>Back</button>
            </div>

            <div className="form-container">
                <form className="form-container" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label><span className="required">*</span> Agent</label>
                            <div className="client-select-wrapper">
                                <div className="client-input">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={clientSearchTerm}
                                        onChange={handleClientSearch}
                                        placeholder="Select Agent"
                                        onClick={() => setShowClientDropdown(true)}
                                    />
                                    <span className="dropdown-arrow" onClick={toggleClientDropdown}>▼</span>
                                </div>

                                {showClientDropdown && (
                                    <div className="client-dropdown">
                                        {filteredClients.length > 0 ? (
                                            filteredClients.map(client => (
                                                <div
                                                    key={client.id}
                                                    className="client-option"
                                                    onClick={() => handleClientSelect(client.id, client.agentNo)}
                                                >
                                                    A{client.agentNo}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-data">
                                                <div className="no-data-icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                                    </svg>
                                                </div>
                                                <div className="no-data-text">No Data</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group" ref={collectionDropdownRef}>
                            <label><span className="required">*</span> Collection</label>
                            <div className="select-wrapper">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={selectedCollection}
                                    readOnly
                                    onClick={toggleCollectionDropdown}
                                    placeholder="Select collection"
                                />
                                {showCollectionDropdown && (
                                    <div className="payment-dropdown">
                                        <div className="payment-dropdown-header">
                                            CASH A/C
                                        </div>
                                        {collectionOptions.map((option, index) => (
                                            <div
                                                key={index}
                                                className="payment-option"
                                                onClick={() => handleCollectionSelect(option.value, option.label)}
                                            >
                                                {option.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label><span className="required">*</span> Date</label>
                            <div className="date-wrapper">
                                <input
                                    type="text"
                                    value={selectedDate}
                                    readOnly
                                    onClick={toggleCalendar}
                                    placeholder="Select date"
                                    className="form-control date-input"
                                />
                                {showCalendar && (
                                    <div className="calendar-dropdown">
                                        <input
                                            type="date"
                                            onChange={handleDateChange}
                                            className="calendar-date-picker"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><span className="required">*</span> Amount</label>
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group" ref={paymentDropdownRef}>
                            <label><span className="required">*</span> Payment Type</label>
                            <div className="select-wrapper">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={paymentType}
                                    placeholder="Select Payment Type"
                                    readOnly
                                    onClick={togglePaymentDropdown}
                                />
                                {showPaymentDropdown && (
                                    <div className="payment-dropdown">
                                        <div className="payment-dropdown-header">
                                            Select Payment Type
                                        </div>
                                        {paymentOptions.map((option, index) => (
                                            <div
                                                key={index}
                                                className="payment-option"
                                                onClick={() => handlePaymentSelect(option.value, option.label)}
                                            >
                                                {option.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label><span className="required">*</span> Remark</label>
                            <input
                                type="text"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Remarks"
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="button-container">
                        <button className="submit-btn" type="submit">Submit</button>
                    </div>
                </form>
            </div>

            <div className="bottom-border"></div>

            {/* Ledger Statement Table for Selected Superagent */}
            {selectedClient && (
                <div className="client-table-container">
                    {selectedSuperAgentLedger.length > 0 ? (
                        <>
                            <div className="client-table-summary" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px 20px',
                                marginBottom: '10px'
                            }}>
                                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '22px', flex: '1', textAlign: 'center' }}>
                                    Dena: {totalDena.toFixed(2)}
                                </span>
                                <span style={{ color: 'green', fontWeight: 'bold', fontSize: '22px', flex: '1', textAlign: 'center' }}>
                                    Lena: {totalLena.toFixed(2)}
                                </span>
                                <span style={{ color: balance >= 0 ? 'green' : 'red', fontWeight: 'bold', fontSize: '22px', flex: '1', textAlign: 'center' }}>
                                    Balance: {balance.toFixed(2)} {balance >= 0 ? '(Lena)' : '(Dena)'}
                                </span>
                            </div>
                            <table className="client-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px', minWidth: '80px' }}>Sr.No</th>
                                        <th>Match Name</th>
                                        <th>Event</th>
                                        <th>Debit</th>
                                        <th>Credit</th>
                                        <th>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedLedger.map((row, idx) => (
                                        <tr
                                            key={row.__key || idx}
                                            style={{
                                                background: idx % 2 === 0 ? '#f8f9fa' : '#fff'
                                            }}
                                        >
                                            <td style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}>{idx + 1}</td>
                                            <td>{row.matchname || '-'}</td>
                                            <td>{row.event || '-'}</td>
                                            <td>{row._displayDebit > 0 ? row._displayDebit.toFixed(2) : '-'}</td>
                                            <td>{row._displayCredit > 0 ? row._displayCredit.toFixed(2) : '-'}</td>
                                            <td>{row._runningBalance.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            No ledger entries found for this agent.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientLenden;
