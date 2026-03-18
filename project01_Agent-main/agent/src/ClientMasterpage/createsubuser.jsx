import React, { useState, useRef, useEffect } from 'react';
import './createClient.css';
import { useNavigate } from "react-router-dom";
import LoadingOverlay from '../components/LoadingOverlay';
import { useProfile } from '../context/ProfileContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useLocation } from "react-router-dom";
const CreateClient = () => {
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    myCoins: '4000',
    clientCoins: '',
    password: '',
    clientMobileCharge: '0',
    myCommType: 'Bet by bet',
    commType: '',
    myCasinoComm: '2',
    casinoComm: '',
    myMatchComm: '',
    matchComm: '',
    mySessComm: '',
    sessComm: '',
    partnershipUser: '',
    partnershipUserName: '',
    lowerPercentage: '',
    upperPercentage: ''
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const data = location.state;
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPartnershipUserDropdownOpen, setIsPartnershipUserDropdownOpen] = useState(false);
  const { profile, fetchNameWallet } = useProfile();
  const dropdownRef = useRef(null);
  const partnershipUserDropdownRef = useRef(null);
  const [success, setSuccess] = useState(false);
  const [partnershipUsers, setPartnershipUsers] = useState([]);
  const [currentUserBalace, setcurrentUserBalace] = useState(0);
  const [currentPartnership, setcurrentPartnership] = useState(0);
  useEffect(() => {
    if (success) {
      setFormData({
        name: '',
        reference: '',
        myCoins: '',
        clientCoins: '',
        password: '',
        clientMobileCharge: '0',
        myCommType: 'Bet by bet',
        commType: '',
        myCasinoComm: '2',
        casinoComm: '',
        myMatchComm: '',
        matchComm: '',
        mySessComm: '',
        sessComm: '',
        partnershipUser: '',
        partnershipUserName: '',
        lowerPercentage: '',
        upperPercentage: ''
      });
      setSuccess(false); // Reset success so it doesn't keep firing
    }
  }, [success]);
  const commissionTypes = [
    'No comm',
    'Bet by bet',
    // 'Match by match',
    // 'Session',
    // 'Monthly'
  ];

  useEffect(() => {
    // Simulate initial load
    setLoading(true);
    fetchNameWallet();
    fetchPartnershipUsers();
    setTimeout(() => {
      setLoading(false);

    }, 800);
  }, []);

  // const fetchPartnershipUsers = async () => {
  //   try {

  //     const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getsubusersdrop/${data.prvrole}`);
  //     console.log(response.data,data.prvrole, "dropdown value")
  //     if (response.data && Array.isArray(response.data)) {
  //       const formattedUsers = response.data.map((client) => ({
  //         id: client._id,
  //         userNo: client.userNo || client.AgentNo || 'N/A',
  //         name: client.email || client.username || 'N/A',
  //         balance: client.balance || 0,
  //         partnership:client.partnership,
  //         displayName: `${client.email || client.username || 'N/A'} (${client.userNo || client.AgentNo || 'N/A'})`
  //       }));
  //       setPartnershipUsers(formattedUsers);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching partnership users:', error);
  //     setPartnershipUsers([]);
  //   }
  // };

  const fetchPartnershipUsers = async () => {
    try {
       // Get storedAgent from localStorage as fallback
      const storedAgent = JSON.parse(localStorage.getItem('agent'));
      const userId = profile?._id || storedAgent?.id;
      console.log(profile?._id , storedAgent?.id, "userId")
      if (!userId) {
        console.error('No user ID found in profile or localStorage');
        setPartnershipUsers([]);
        return;
      }
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/getsubusersdrop/${data.prvrole}`
      );
  
      if (response.data && Array.isArray(response.data)) {
  
        let filteredUsers = response.data;
  
        // ✅ Case 1: subadmin → match _id
        if (data.prvrole === "agent") {
          filteredUsers = response.data.filter(
          (user) => user._id === userId
          );
        }
  
        // ✅ Case 2: agent, master, superagent, client → match parentId
        if (
          ["client"].includes(data.prvrole)
        ) {
          filteredUsers = response.data.filter(
            (user) =>
              Array.isArray(user.parentId) &&
              user.parentId.includes(userId)
          );
        }
  
        const formattedUsers = filteredUsers.map((client) => ({
          id: client._id,
          userNo: client.userNo || client.AgentNo || "N/A",
          name: client.email || client.username || "N/A",
          balance: client.balance || 0,
          partnership: client.partnership,
          displayName: `${client.email || client.username || "N/A"} (${client.userNo || client.AgentNo || "N/A"})`
        }));
  
        setPartnershipUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching partnership users:", error);
      setPartnershipUsers([]);
    }
  };
  


  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (partnershipUserDropdownRef.current && !partnershipUserDropdownRef.current.contains(event.target)) {
        setIsPartnershipUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => {

        if (name === "matchComm") {
        if (Number(value) > 2) {
          setErrors(prev => ({
            ...prev,
            matchComm: "Match Comm cannot be greater than 2%"
          }));
          return prevState;
        }
      }

      // ✅ Session Commission Max 3
      if (name === "sessComm") {
        if (Number(value) > 3) {
          setErrors(prev => ({
            ...prev,
            sessComm: "Sess. Comm cannot be greater than 3%"
          }));
          return prevState;
        }
      }
       
      const newState = {
        ...prevState,
        [name]: value
      };

      // Auto-calculate upper percentage from lower percentage based on currentPartnership
      if (name === 'lowerPercentage') {
        const lowerPercent = parseFloat(value) || 0;
        // Validate that lowerPercentage doesn't exceed currentPartnership
        if (currentPartnership > 0 && lowerPercent > currentPartnership) {
          // Don't update if it exceeds currentPartnership
          return prevState;
        }
        // Calculate upper percentage based on currentPartnership
        const upperPercent = currentPartnership > 0 && lowerPercent > 0 
          ? currentPartnership - lowerPercent 
          : '';
        newState.upperPercentage = upperPercent.toString();
      }

      return newState;
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const handleIncrement = () => {
    setFormData(prevState => ({
      ...prevState,
      clientMobileCharge: String(parseInt(prevState.clientMobileCharge || '0') + 1)
    }));
  };

  const handleDecrement = () => {
    setFormData(prevState => {
      const currentValue = parseInt(prevState.clientMobileCharge || '0');
      const newValue = currentValue > 0 ? currentValue - 1 : 0;
      return {
        ...prevState,
        clientMobileCharge: String(newValue)
      };
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const togglePartnershipUserDropdown = () => {
    setIsPartnershipUserDropdownOpen(!isPartnershipUserDropdownOpen);
  };

  const selectCommType = (type) => {
    setFormData(prevState => ({
      ...prevState,
      commType: type
    }));
    setIsDropdownOpen(false);

    // Clear error when field is selected
    if (errors.commType) {
      setErrors(prevErrors => ({
        ...prevErrors,
        commType: ''
      }));
    }
  };

  const selectPartnershipUser = (user) => {
    setFormData(prevState => ({
      ...prevState,
      partnershipUser: user.id,
      partnershipUserName: user.displayName,
      lowerPercentage: '', // Reset lower percentage when new user is selected
      upperPercentage: '' // Reset upper percentage when new user is selected
    }));
    setIsPartnershipUserDropdownOpen(false);
    setcurrentUserBalace(user.balance);
    setcurrentPartnership(user.partnership || 0);
    // Clear error when field is selected
    if (errors.partnershipUser) {
      setErrors(prevErrors => ({
        ...prevErrors,
        partnershipUser: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.reference.trim()) {
      newErrors.reference = 'Number is required';
    }

    if (!formData.clientCoins.trim()) {
      newErrors.clientCoins = 'Coins are required';
    } else if (parseInt(formData.clientCoins) > parseInt(currentUserBalace)) {
      newErrors.clientCoins = 'Coins cannot be greater than My Coins';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!formData.commType.trim()) {
      newErrors.commType = 'Commission type is required';
    }

    if (!formData.casinoComm.trim()) {
      newErrors.casinoComm = 'Casino commission is required';
    }

    if (!formData.partnershipUser.trim()) {
      newErrors.partnershipUser = 'parent user is required';
    }

    // Validate lowerPercentage doesn't exceed currentPartnership
    if (formData.lowerPercentage && currentPartnership > 0) {
      const lowerPercent = parseFloat(formData.lowerPercentage) || 0;
      if (lowerPercent > currentPartnership) {
        newErrors.lowerPercentage = `Lower percentage cannot be greater than current partnership (${currentPartnership}%)`;
      }
    }

     // Match Comm Validation
    if (formData.matchComm && Number(formData.matchComm) > 2) {
      newErrors.matchComm = "Match Comm must be ≤ 2%";
    }

    // Sess Comm Validation
    if (formData.sessComm && Number(formData.sessComm) > 3) {
      newErrors.sessComm = "Sess Comm must be ≤ 3%";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setLoading(true);
      // Prepare payload - map frontend fields to backend expected format
      const payload = {
        username: formData.reference, // number/reference becomes username
        name: formData.name,
        password: formData.password,
        balance: parseFloat(formData.clientCoins) || 0, // coins becomes balance
        role: data.role, // role from location state
        parentId: formData.partnershipUser, // partnership user ID
        partnership: parseFloat(formData.lowerPercentage) || 0, // lower percentage as partnership
        agent: profile.AgentNo, // AgentNo for finding parent
        commType: formData.commType || 'Bet by bet',
        matchComm: formData.matchComm || '2',
        sessComm: formData.sessComm || '3',
        casinoComm: formData.casinoComm || '0',
      };
      console.log(payload);
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/createSubuser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        setLoading(false);
        if (result.success) {
          toast.success(result.message || 'User created successfully!');
          setSuccess(true);
          fetchNameWallet();
          setTimeout(() => {
            navigate(-1);
          }, 1000)

        } else {
          toast.error(result.message || 'Failed to create user.');
        }
      } catch (error) {
        setLoading(false);
        console.error('Error creating user:', error);
        toast.error('Error creating user.');
      }
    } else {
      console.log('Form has errors:', errors);
    }
  };

  const handleBack = () => {
    // Handle back button logic - navigate to previous page
    setLoading(true);
    setTimeout(() => {
      console.log('Back button clicked');
      navigate('/client-master');
      setLoading(false);
    }, 500);
  };

  return (
    <div className="create-client-container">
      <LoadingOverlay loading={loading} />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="header">
        <div className="title">{`Create ${data.role}`}</div>
        <button className="back-btn" onClick={handleBack}>Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          <div className="form-row">
            <div className="form-group wide">
              <label><span className="required">*</span> Select User</label>
              <div className="dropdown" ref={partnershipUserDropdownRef}>
                <input
                  type="text"
                  name="partnershipUser"
                  value={formData.partnershipUserName || ''}
                  onChange={handleChange}
                  placeholder="Select User"
                  readOnly
                  onClick={togglePartnershipUserDropdown}
                  className={errors.partnershipUser ? 'error' : ''}
                />
                <span className="dropdown-arrow" onClick={togglePartnershipUserDropdown}>▼</span>
                {isPartnershipUserDropdownOpen && (
                  <div className="dropdown-menu">
                    {partnershipUsers.length > 0 ? (
                      partnershipUsers.map((user, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => selectPartnershipUser(user)}
                        >
                          {user.displayName}
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-item">No users available</div>
                    )}
                  </div>
                )}
                {errors.partnershipUser && <div className="error-message">{errors.partnershipUser}</div>}
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><span className="required">*</span>Reference</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Reference"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label><span className="required">*</span>Name</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Enter name"
                className={errors.reference ? 'error' : ''}
              />
              {errors.reference && <div className="error-message">{errors.reference}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>My Coins</label>
              <input
                type="text"
                name="myCoins"
                value={currentUserBalace}
                onChange={currentUserBalace}
                placeholder={currentUserBalace}
                disabled
              />
            </div>
            <div className="form-group">
              <label><span className="required">*</span> Coins</label>
              <input
                type="number"
                name="clientCoins"
                value={formData.clientCoins}
                onChange={handleChange}
                placeholder="Client Coins"
                className={errors.clientCoins ? 'error' : ''}
                min="0"
                max={currentUserBalace}
              />
              {errors.clientCoins && <div className="error-message">{errors.clientCoins}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group wide">
              <label><span className="required">*</span> Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group wide">
              <label><span className="required">*</span> Client Mobile Charge</label>
              <div className="spinner-container">
                <input
                  type="number"
                  name="clientMobileCharge"
                  value={formData.clientMobileCharge}
                  onChange={handleChange}
                  className="spinner-input"
                />
                <div className="spinner-buttons">
                  <button
                    type="button"
                    className="spinner-up"
                    onClick={handleIncrement}
                  >▲</button>
                  <button
                    type="button"
                    className="spinner-down"
                    onClick={handleDecrement}
                  >▼</button>
                </div>
              </div>
            </div>
          </div>

          <div className="section-title">Client Match Share and Commission</div>

          <div className="form-row">
            <div className="form-group">
              <label>My Comm type</label>
              <input
                type="text"
                name="myCommType"
                value={formData.myCommType}
                onChange={handleChange}
                placeholder="Bet by bet"
                readOnly
              />
            </div>
            <div className="form-group">
              <label><span className="required">*</span> Comm type</label>
              <div className="dropdown" ref={dropdownRef}>
                <input
                  type="text"
                  name="commType"
                  value={formData.commType}
                  onChange={handleChange}
                  placeholder="Commission Type"
                  readOnly
                  onClick={toggleDropdown}
                  className={errors.commType ? 'error' : ''}
                />
                <span className="dropdown-arrow" onClick={toggleDropdown}>▼</span>
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    {commissionTypes.map((type, index) => (
                      <div
                        key={index}
                        className="dropdown-item"
                        onClick={() => selectCommType(type)}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
                {errors.commType && <div className="error-message">{errors.commType}</div>}
              </div>
            </div>
          </div>

          {formData.commType === 'Bet by bet' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>My Match Comm(%)</label>
                  <input
                    type="text"
                    name="myMatchComm"
                    value={formData.myMatchComm}
                    onChange={handleChange}
                    placeholder="2"
                  />
                </div>
                   <div className="form-group">
                  <label>Match Comm (%)</label>
                  <input
                    type="number"
                    name="matchComm"
                    value={formData.matchComm}
                    onChange={handleChange}
                    max="2"
                    placeholder="client Match Commission"
                    className={errors.matchComm ? 'error' : ''}
                  />

                  {errors.matchComm && (
                    <div className="error-message">
                      {errors.matchComm}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>My Sess Comm(%)</label>
                  <input
                    type="text"
                    name="mySessComm"
                    value={formData.mySessComm}
                    onChange={handleChange}
                    placeholder="3"
                  />
                </div>
                <div className="form-group">
                  <label>Sess Comm(%)</label>
                  <input
                    type="number"
                    name="sessComm"
                    value={formData.sessComm}
                    onChange={handleChange}
                    max="3"
                    placeholder="client Session Commission"
                    className={errors.sessComm ? 'error' : ''}
                  />

                  {errors.sessComm && (
                    <div className="error-message">
                      {errors.sessComm}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}


          {/* <div className="section-title">Partnership Percentage</div>
          <div className="form-row">
            <div className="form-group">
              <label>Lower Percentage (%)</label>
              <input
                type="number"
                name="lowerPercentage"
                value={formData.lowerPercentage}
                onChange={handleChange}
                placeholder="Enter lower percentage"
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Upper Percentage (%)</label>
              <input
                type="text"
                name="upperPercentage"
                value={formData.upperPercentage}
                onChange={handleChange}
                placeholder="Auto-calculated from Lower Percentage"
                readOnly
                style={{ backgroundColor: '#f5f5f5', color: '#999' }}
              />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                Auto-calculated from Lower Percentage
              </div>
            </div>
          </div> */}
          {data.role !== 'client' && (
            <>
              <div className="section-title">Partnership Percentage</div>

              <div className="form-row">
                <div className="form-group">
                  <label>Lower Percentage (%)</label>
                  <input
                    type="number"
                    name="lowerPercentage"
                    value={formData.lowerPercentage}
                    onChange={handleChange}
                    min="0"
                    max={currentPartnership || 100}
                    placeholder={currentPartnership > 0 ? `Max: ${currentPartnership}%` : ''}
                    className={errors.lowerPercentage ? 'error' : ''}
                  />
                  {currentPartnership > 0 && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      Current Partnership: {currentPartnership}%
                    </div>
                  )}
                  {errors.lowerPercentage && <div className="error-message">{errors.lowerPercentage}</div>}
                </div>

                <div className="form-group">
                  <label>Upper Percentage (%)</label>
                  <input
                    type="text"
                    value={formData.upperPercentage}
                    readOnly
                    style={{ backgroundColor: '#f5f5f5', color: '#999' }}
                    placeholder={currentPartnership > 0 ? `Auto-calculated (${currentPartnership}% - Lower%)` : 'Auto-calculated'}
                  />
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    Auto-calculated from Current Partnership
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="section-title">Client Casino Share and Commission</div>
          <div className="form-row">
            <div className="form-group">
              <label>My Casino comm(%)</label>
              <input
                type="text"
                name="myCasinoComm"
                value={formData.myCasinoComm}
                onChange={handleChange}
                placeholder="2"
              />
            </div>
            <div className="form-group">
              <label><span className="required">*</span> Casino comm(%)</label>
              <input
                type="text"
                name="casinoComm"
                value={formData.casinoComm}
                onChange={handleChange}
                placeholder="Casino commission"
                className={errors.casinoComm ? 'error' : ''}
              />
              {errors.casinoComm && <div className="error-message">{errors.casinoComm}</div>}
            </div>
          </div>
        </div>

        <div className="footer">
          <button type="submit" className="submit-btn">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default CreateClient;
