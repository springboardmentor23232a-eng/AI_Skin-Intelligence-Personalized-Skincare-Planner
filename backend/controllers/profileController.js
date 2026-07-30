import { findUserById, updateUserProfile } from '../models/userModel.js';

/**
 * GET /api/profile
 * Retrieve authenticated user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '404 Not Found: User profile does not exist'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        profile_picture: user.profile_picture || '',
        bio: user.bio || '',
        phone: user.phone || '',
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (err) {
    console.error('Get Profile Error:', err);
    return res.status(500).json({
      success: false,
      message: '500 Internal Server Error: Failed to fetch profile'
    });
  }
};

/**
 * PUT /api/profile
 * Update allowed profile fields (name, email, profile_picture, bio, phone).
 * Immutable fields: role, provider.
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, profile_picture, avatarUrl, bio, phone, role, provider } = req.body;

    // Explicitly prevent role and provider modification
    if (role && role !== req.user.role) {
      return res.status(403).json({
        success: false,
        message: '403 Forbidden: Security violation - Modification of user role is strictly prohibited via profile API.'
      });
    }
    if (provider && provider !== req.user.provider) {
      return res.status(403).json({
        success: false,
        message: '403 Forbidden: Security violation - Modification of auth provider is strictly prohibited.'
      });
    }

    const pictureToUpdate = profile_picture !== undefined ? profile_picture : avatarUrl;

    const updatedUser = await updateUserProfile(userId, {
      name,
      email,
      profile_picture: pictureToUpdate,
      bio,
      phone
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: '404 Not Found: User record not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        provider: updatedUser.provider,
        profile_picture: updatedUser.profile_picture || '',
        bio: updatedUser.bio || '',
        phone: updatedUser.phone || '',
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return res.status(500).json({
      success: false,
      message: '500 Internal Server Error: Failed to update profile'
    });
  }
};
