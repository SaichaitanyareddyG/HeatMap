import React, { useEffect, useState } from 'react';
import { calculateWorkExperience } from './utils';
import { Heatmap } from './heatMap';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddIconCricle from '@mui/icons-material/AddCircle';

import RemoveIcon from '@mui/icons-material/Remove';

export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]); 
  const [selectedUsers, setSelectedUsers] = useState([]); 
  const [selectedUserDetails, setSelectedUserDetails] = useState([]); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          'https://forinterview.onrender.com/people'
        );
        if (!response.ok) {
          throw new Error('Error fetching users');
        }
        const data = await response.json();
        setUsers(data); 

        setRecommendedUsers(data.slice(0, 4)); 
      } catch (error) {
        setError('Error fetching users');
      }
    };
    fetchUsers();
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(
        `https://forinterview.onrender.com/people/${userId}`
      );
      if (!response.ok) {
        throw new Error('Error fetching user details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const handleUserSelect = async (user) => {
    if (selectedUsers.some((selected) => selected.id === user.id)) {
      setSelectedUsers(
        selectedUsers.filter((selected) => selected.id !== user.id)
      );
      setSelectedUserDetails(
        selectedUserDetails.filter((detail) => detail.id !== user.id)
      );
    } else {
      setSelectedUsers([...selectedUsers, user]);

      const userDetails = await fetchUserDetails(user.id);
      if (userDetails) {
        setSelectedUserDetails([
          ...selectedUserDetails,
          { id: user.id, data: userDetails },
        ]);
      }
    }
  };

  const skillsScore = (jsonData) => {
    const skillsWithScores = jsonData.flatMap((skillset) =>
      skillset.skills.map((skill) => ({
        skillName: skill.name,
        consensusScore: skill.pos[0].consensus_score,
      }))
    );
    return skillsWithScores;
  };

  const prepareHeatmapData = (selectedUserDetails) => {
    return selectedUserDetails.map((user) => {
      const skillset = user.data?.data?.data?.skillset; 

      const experience = calculateWorkExperience(
        user.data?.data?.user_data?.user?.workEx || 0
      );

      if (!skillset) {
        return {
          id: user.id,
          experience: experience, 
          skills: {}, 
        };
      }

      const skills = skillsScore(skillset).reduce((acc, skill) => {
        acc[skill.skillName] = skill.consensusScore;
        return acc;
      }, {});

      return {
        id: user.id,
        experience: experience, 
        skills: skills, 
      };
    });
  };

  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{
          width: '250px',
          borderRight: '1px solid #ccc',
          padding: '10px',
            border: '1px solid'
        }}
      >
        {error && <p>{error}</p>}

        <div style={{ backgroundColor: '#F6F6EF', padding: '10px', marginBottom: '20px', borderRadius: '5px',
        
         }}>
          <h2>Most Recommended</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {recommendedUsers.map((user) => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <span>{user.name}</span>
                <IconButton onClick={() => handleUserSelect(user)}>
                  {selectedUsers.some((selected) => selected.id === user.id) ? (
                    <RemoveIcon color="error" />
                  ) : (
                    <AddIconCricle style={{
                      color: '#C3BBFF'
                    }} />
                  )}
                </IconButton>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Recommendations are based on your skill requirements and candidate's performance.
          </p>
        </div>

        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {users.map((user) => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <span>{user.name}</span>
                <IconButton onClick={() => handleUserSelect(user)}>
                  {selectedUsers.some((selected) => selected.id === user.id) ? (
                    <RemoveIcon color="error" />
                  ) : (
                    <AddIconCricle style={{
                      color: '#C3BBFF'
                    }} />
                  )}
                </IconButton>
              </div>
            ))}
          </div>
      </div>

      <div style={{ flexGrow: 1, padding: '10px' }}>
        {selectedUserDetails.length > 0 && (
          <Heatmap data={prepareHeatmapData(selectedUserDetails)} />
        )}
      </div>
    </div>
  );
};
