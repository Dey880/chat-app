import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import styles from '../css/Profile.module.css'

export default function Profile() {
  const [userInfo, setUserInfo] = useState({
    displayName: '',
    bio: '',
    profilePicture: '',
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const color = `$${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  const sanitizeFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9 _\-:;.,|]/g, '_');
  };
  
  const pfpApi = (name) => {
    const sanitizedDisplayName = sanitizeFileName(name);
    return `https://api.nilskoepke.com/profile-image/?name=${sanitizedDisplayName}&backgroundColor=${color}`;
  };

  useEffect(() => {
    axios.get("http://localhost:4000/api/user", { withCredentials: true })
      .then((response) => {
        const { displayName, bio, profilePicture } = response.data;
        const profilePfp = profilePicture || pfpApi(displayName || response.data.email);
        setUserInfo({
          displayName,
          bio,
          profilePicture: profilePfp,
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
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type.startsWith('image/')) {
      setFile(uploadedFile);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const handleResetProfilePicture = () => {
    setFile(null);
    setUserInfo((prev) => ({
      ...prev,
      profilePicture: pfpApi(userInfo.displayName || 'Default User'),
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);

    const url = e.dataTransfer.getData('text/plain');

    if (url) {
      try {
        const proxyUrl = `http://localhost:4000/api/proxy-profile-image?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error('Failed to fetch the image from the proxy');
        }

        const svgBlob = await response.blob();
        const file = new File([svgBlob], `profile-picture.svg`, { type: 'image/svg+xml' });
        setFile(file);
      } catch (error) {
        console.error('Error processing dropped SVG:', error);
        alert('Failed to process the dropped image.');
      }
    } else {
      alert('Please drop a valid image URL.');
    }
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
      const response = await axios.put("http://localhost:4000/api/user", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      navigate('/chat');

    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const displayPicture = file
    ? URL.createObjectURL(file)
    : userInfo.profilePicture;

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
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={styles.dropArea}
          style={{
            border: dragActive ? '2px dashed #000' : '2px solid #ccc'
          }}
        >
          <label>Profile Picture:</label>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="fileInput"
            accept="image/*"
          />
          <p>{dragActive ? "Drop your image here" : "Drag and drop your image or click to upload"}</p>
          <button type="button" onClick={() => document.getElementById('fileInput').click()}>Choose File</button>
          <p>Drag the pre-generated profile picture into the drop area to select it</p>
          {displayPicture && (
            <div>
              <img
                className={styles.apiImg}
                src={displayPicture}
                alt="Profile"
              />
            </div>
          )}
          <button type="button" onClick={handleResetProfilePicture}>Reset to Default / Generate profile picture</button>
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}