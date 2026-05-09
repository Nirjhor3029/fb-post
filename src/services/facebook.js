const axios = require("axios");
const config = require("../config");
const qs = require("qs");

const BASE_URL = `https://graph.facebook.com/${config.facebook.apiVersion}`;

const facebookClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// const postToFacebook = async (imageUrl, caption) => {
//   try {
//     const response = await facebookClient.post(`/${config.facebook.pageId}/photos`, {
//       url: imageUrl,
//       caption: caption || '',
//       access_token: config.facebook.accessToken,
//     });

//     return {
//       success: true,
//       postId: response.data.post_id || response.data.id,
//       postUrl: `https://facebook.com/${response.data.post_id || response.data.id}`,
//       postedAt: new Date().toISOString(),
//     };
//   } catch (error) {
//     if (error.response?.data?.error) {
//       const fbError = error.response.data.error;
//       return {
//         success: false,
//         error: {
//           code: fbError.code || 'UNKNOWN',
//           type: fbError.type || 'FacebookApiError',
//           message: fbError.message || 'Facebook API returned an error',
//         },
//       };
//     }

//     return {
//       success: false,
//       error: {
//         code: 'NETWORK_ERROR',
//         type: 'NetworkError',
//         message: error.message || 'Failed to reach Facebook API',
//       },
//     };
//   }
// };

// const postToFacebook = async (imageUrl, caption) => {
//   try {
//     // STEP 1: Upload photo as unpublished
//     const photoUploadResponse = await facebookClient.post(
//       `/${config.facebook.pageId}/photos`,
//       {
//         url: imageUrl,
//         published: false,
//         access_token: config.facebook.accessToken,
//       },
//     );

//     const photoId = photoUploadResponse.data.id;

//     //  return {
//     //   success: true,
//     //   postId: photoId,
//     //   postUrl: `https://facebook.com/${photoId}`,
//     //   postedAt: new Date().toISOString(),
//     // };

//     // STEP 2: Create actual feed/timeline post
//     // const feedResponse = await facebookClient.post(
//     //   `/${config.facebook.pageId}/feed`,
//     //   {
//     //     message: caption || "",
//     //     // attached_media: [
//     //     //   {
//     //     //     media_fbid: photoId,
//     //     //   },
//     //     // ],
//     //     attached_media: JSON.stringify([
//     //       {
//     //         media_fbid: photoId,
//     //       },
//     //     ]),
//     //     access_token: config.facebook.accessToken,
//     //   },
//     // );

//     const feedResponse = await facebookClient.post(
//       `/${config.facebook.pageId}/feed`,
//       qs.stringify({
//         message: caption || "",
//         "attached_media[0]": JSON.stringify({
//           media_fbid: photoId,
//         }),
//         access_token: config.facebook.accessToken,
//       }),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       },
//     );

//     const debugResponse = await facebookClient.get(`/${feedResponse.data.id}`, {
//       params: {
//         fields: "id,message,permalink_url,is_published,status_type,attachments",
//         access_token: config.facebook.accessToken,
//       },
//     });

//     console.log(debugResponse.data);

//     return {
//       success: true,
//       response: feedResponse.data,
//       postId: feedResponse.data.id,
//       postUrl: `https://facebook.com/${feedResponse.data.id}`,
//       postedAt: new Date().toISOString(),
//     };
//   } catch (error) {
//     if (error.response?.data?.error) {
//       const fbError = error.response.data.error;

//       return {
//         success: false,
//         error: {
//           code: fbError.code || "UNKNOWN",
//           type: fbError.type || "FacebookApiError",
//           message: fbError.message || "Facebook API returned an error",
//         },
//       };
//     }

//     return {
//       success: false,
//       error: {
//         code: "NETWORK_ERROR",
//         type: "NetworkError",
//         message: error.message || "Failed to reach Facebook API",
//       },
//     };
//   }
// };

const postToFacebook = async (imageUrl, caption) => {
  try {
    const response = await facebookClient.post(
      `/${config.facebook.pageId}/photos`,
      qs.stringify({
        url: imageUrl,
        caption: caption || "",
        published: true,
        access_token: config.facebook.accessToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const postId = response.data.post_id || response.data.id;

    const debug = await facebookClient.get(`/${postId}`, {
      params: {
        fields: "id,permalink_url,is_published,status_type",
        access_token: config.facebook.accessToken,
      },
    });

    console.log(debug.data);

    return {
      success: true,
      postId,
      postUrl: debug.data.permalink_url,
      postedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.log(error.response?.data || error);

    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

// const postToFacebook = async (caption) => {
//   try {
//     const response = await facebookClient.post(
//       `/${config.facebook.pageId}/feed`,
//       qs.stringify({
//         message: caption || "Test text post",
//         access_token: config.facebook.accessToken,
//       }),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       },
//     );

//     const postId = response.data.id;

//     const debug = await facebookClient.get(`/${postId}`, {
//       params: {
//         fields: "id,message,permalink_url,is_published,status_type",
//         access_token: config.facebook.accessToken,
//       },
//     });

//     console.log(debug.data);

//     return {
//       success: true,
//       postId,
//       postUrl: debug.data.permalink_url,
//       postedAt: new Date().toISOString(),
//     };
//   } catch (error) {
//     console.log(error.response?.data || error);

//     return {
//       success: false,
//       error: error.response?.data || error.message,
//     };
//   }
// };

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
          code: fbError.code || "UNKNOWN",
          type: fbError.type || "TokenValidationError",
          message: fbError.message || "Token validation failed",
        },
      };
    }

    return {
      valid: false,
      error: {
        code: "NETWORK_ERROR",
        type: "NetworkError",
        message: error.message || "Failed to validate token",
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
          code: fbError.code || "UNKNOWN",
          type: fbError.type || "PostFetchError",
          message: fbError.message || "Failed to fetch post info",
        },
      };
    }

    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        type: "NetworkError",
        message: error.message || "Failed to reach Facebook API",
      },
    };
  }
};

module.exports = {
  postToFacebook,
  validateToken,
  getPostInfo,
};
