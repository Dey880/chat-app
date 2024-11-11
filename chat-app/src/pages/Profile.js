import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile() {
  const [userInfo, setUserInfo] = useState({
    displayName: '',
    bio: '',
    profilePicture: ''
  });
  const [file, setFile] = useState(null); // To store the selected profile picture

  useEffect(() => {
    // Fetch user data when the page loads (assumes JWT token is stored in cookie)
    axios.get('http://localhost:4000/api/user', { withCredentials: true })
      .then((response) => {
        setUserInfo({
          displayName: response.data.displayName,
          bio: response.data.bio,
          profilePicture: response.data.profilePicture,
        });
      })
      .catch((error) => {
        console.error('Error fetching user info:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('displayName', userInfo.displayName);
    formData.append('bio', userInfo.bio);
    if (file) {
      formData.append('profilePicture', file);
    }

    try {
      const response = await axios.put('http://localhost:4000/api/user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      console.log('Profile updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div>
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Display Name:</label>
          <input
            type="text"
            name="displayName"
            value={userInfo.displayName}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Bio:</label>
          <textarea
            name="bio"
            value={userInfo.bio}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Profile Picture:</label>
          <input
            type="file"
            onChange={handleFileChange}
          />
          {userInfo.profilePicture && (
            <img
              src={userInfo.profilePicture}
              alt="Profile"
              style={{ width: '100px', height: '100px' }}
            />
          )}
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}