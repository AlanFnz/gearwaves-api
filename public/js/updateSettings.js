/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// passwordCurrent, password, passwordConfirm
export const updateSettings = async (data, type) => {
  try {
    const endpoint = type === 'password' ? 'updateMyPassword' : 'updateMe'
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/users/${endpoint}`,
      data,
    });
    if (res.data.status === 'success') {
      const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
      showAlert('success', `${typeCapitalized} updated successfully`);
      window.setTimeout(() => {
        location.assign('/me');
      }, 1000);
    };
  } catch (err) {
    showAlert('error', err.response.data.message)
  };
};
