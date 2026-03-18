import React, { useState, useRef, useEffect } from 'react';
import './createClient.css';
import { useNavigate } from "react-router-dom";
import LoadingOverlay from '../components/LoadingOverlay';
import { useProfile } from '../context/ProfileContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
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
    sessComm: ''
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { profile, fetchNameWallet } = useProfile();
  const dropdownRef = useRef(null);
  const [success, setSuccess] = useState(false);
  const partnershipUserDropdownRef = useRef(null);

  const [partnershipUsers, setPartnershipUsers] = useState([]);
  const [isPartnershipUserDropdownOpen, setIsPartnershipUserDropdownOpen] = useState(false);
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
        sessComm: ''
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
    setTimeout(() => {
      setLoading(false);

    }, 800);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

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
    } else if (parseInt(formData.clientCoins) > parseInt(profile.balance)) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setLoading(true);
      // Prepare payload
      const payload = {
        name: formData.name,
        password: formData.password,
        number: formData.reference,
        coins: formData.clientCoins,
        agent: profile.AgentNo

      };
      console.log(payload);
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/createclientsbyagent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        setLoading(false);
        if (result.success) {
          toast.success('Client created successfully!');
          setSuccess(true);
          fetchNameWallet();
          setTimeout(() => {
            navigate('/client-master');
          }, 1000)

        } else {
          toast.error(result.message || 'Failed to create client.');
        }
      } catch (error) {
        setLoading(false);
        toast.error('Error creating client.');
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



  useEffect(() => {
    // Simulate initial load
    setLoading(true);
    fetchNameWallet();
    fetchPartnershipUsers();
    setTimeout(() => {
      setLoading(false);

    }, 800);
  }, []);

  const fetchPartnershipUsers = async () => {
    try {

      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/getsubusersdrop/${"agent"}`);
      console.log(response.data)
      if (response.data && Array.isArray(response.data)) {
        const formattedUsers = response.data.map((client) => ({
          id: client._id,
          userNo: client.userNo || client.AgentNo || 'N/A',
          name: client.email || client.username || 'N/A',
          displayName: `${client.email || client.username || 'N/A'} (${client.userNo || client.AgentNo || 'N/A'})`
        }));
        setPartnershipUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching partnership users:', error);
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


  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const dummyUsers = [
    { id: 1, name: 'Rahul Sharma', number: '9991112222' },
    { id: 2, name: 'Amit Verma', number: '8883334444' },
    { id: 3, name: 'Suresh Patel', number: '7775556666' },
  ];


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleUserSelect = (user) => {
    setSelectedUser(user);

    setIsUserDropdownOpen(false);
  };

  return (
    <div className="create-client-container">
      <LoadingOverlay loading={loading} />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="header">
        <div className="title">Create Client</div>
        <button className="back-btn" onClick={handleBack}>Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          <div className="form-row">
            <div className="form-group wide" ref={userDropdownRef}>
              <label>Select User</label>

              <div className="dropdown">
                <input
                  type="text"
                  placeholder="Select user"
                  value={selectedUser ? selectedUser.name : ''}
                  readOnly
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                />
                <span
                  className="dropdown-arrow"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  ▼
                </span>

                {isUserDropdownOpen && (
                  <div className="dropdown-menu">
                    {dummyUsers.map((user) => (
                      <div
                        key={user.id}
                        className="dropdown-item"
                        onClick={() => handleUserSelect(user)}
                      >
                        {user.name} ({user.number})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><span className="required">*</span> Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label><span className="required">*</span> Number</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Enter Reference"
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
                value={profile.balance}
                onChange={handleChange}
                placeholder={profile.balance}
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
                max={profile.balance}
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
                    type="text"
                    name="matchComm"
                    value={formData.matchComm}
                    onChange={handleChange}
                    placeholder="client Match Commission"
                  />
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
                    type="text"
                    name="sessComm"
                    value={formData.sessComm}
                    onChange={handleChange}
                    placeholder="client Session Commission"
                  />
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
