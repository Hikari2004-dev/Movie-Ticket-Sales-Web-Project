import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8080/api/loyalty';

const getAuthHeader = () => {
    const token = Cookies.get('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const loyaltyService = {
    // Lấy lịch sử tích điểm
    getPointsHistory: async (userId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/points/history/${userId}`,
                { headers: getAuthHeader() }
            );
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching points history:', error);
            throw error;
        }
    },

    // Lấy số dư điểm
    getPointsBalance: async (userId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/points/balance/${userId}`,
                { headers: getAuthHeader() }
            );
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching points balance:', error);
            throw error;
        }
    }
};
