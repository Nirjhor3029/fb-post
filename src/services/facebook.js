const axios = require('axios');
const config = require('../config');

const BASE_URL = `https://graph.facebook.com/${config.facebook.apiVersion}`;

const facebookClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

const postToFacebook = async (imageUrl, caption) => {
  try {
    const response = await facebookClient.post(`/${config.facebook.pageId}/photos`, {
      url: imageUrl,
      caption: caption || '',
      access_token: config.facebook.accessToken,
    });

    return {
      success: true,
      postId: response.data.post_id || response.data.id,
      postUrl: `https://facebook.com/${response.data.post_id || response.data.id}`,
      postedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      return {
        success: false,
        error: {
          code: fbError.code || 'UNKNOWN',
          type: fbError.type || 'FacebookApiError',
          message: fbError.message || 'Facebook API returned an error',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        type: 'NetworkError',
        message: error.message || 'Failed to reach Facebook API',
      },
    };
  }
};

const validateToken = async () => {
  try {
    const response = await facebookClient.get(`/${config.facebook.pageId}`, {
      params: { access_token: config.facebook.accessToken },
    });

    return {
      valid: true,
      pageName: response.data.name,
      pageId: response.data.id,
    };
  } catch (error) {
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      return {
        valid: false,
        error: {
          code: fbError.code || 'UNKNOWN',
          type: fbError.type || 'TokenValidationError',
          message: fbError.message || 'Token validation failed',
        },
      };
    }

    return {
      valid: false,
      error: {
        code: 'NETWORK_ERROR',
        type: 'NetworkError',
        message: error.message || 'Failed to validate token',
      },
    };
  }
};

const getPostInfo = async (postId) => {
  try {
    const response = await facebookClient.get(`/${postId}`, {
      params: { access_token: config.facebook.accessToken },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error.response?.data?.error) {
      const fbError = error.response.data.error;
      return {
        success: false,
        error: {
          code: fbError.code || 'UNKNOWN',
          type: fbError.type || 'PostFetchError',
          message: fbError.message || 'Failed to fetch post info',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        type: 'NetworkError',
        message: error.message || 'Failed to reach Facebook API',
      },
    };
  }
};

module.exports = {
  postToFacebook,
  validateToken,
  getPostInfo,
};
