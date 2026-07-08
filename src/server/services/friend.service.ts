import { friendRepository } from "../repositories/friend.repository";
import { FriendshipStatus } from "@/generated/enums";

export const friendService = {
  sendFriendRequest: async (userId: string, targetUserId: string) => {
    if (userId === targetUserId) {
      throw new Error("You cannot send a friend request to yourself.");
    }

    const existingFriendship = await friendRepository.getFriendshipByUsers(userId, targetUserId);
    
    if (existingFriendship) {
      throw new Error("Friendship or pending request already exists.");
    }

    return friendRepository.createFriendship(userId, targetUserId, FriendshipStatus.PENDING);
  },

  acceptFriendRequest: async (userId: string, friendshipId: string) => {
    if(!userId) throw new Error("User not found");

    return friendRepository.updateFriendshipStatus(friendshipId, FriendshipStatus.ACCEPTED);
  },

  removeFriend: async (userId: string, friendshipId: string) => {
    const friendship = await friendRepository.getFriendshipById(friendshipId);
    
    if (!friendship) throw new Error("Friendship not found.");
    if (friendship.userId !== userId && friendship.friendId !== userId) throw new Error("You are not a party to this friendship.");
    
    return friendRepository.deleteFriendship(friendshipId);
  },

  getFriends: async (userId: string) => {
    if(!userId) throw new Error("User not found");

    return friendRepository.getUserFriends(userId);
  }, 

  getFriendShipById: async (friendshipId: string) => {
    if(!friendshipId) throw new Error("Friendship not found");

    return friendRepository.getFriendshipById(friendshipId)
  },

  getFriendShipByUsers: async (userId: string, targetUserId: string) => {
    if(!userId || !targetUserId) throw new Error("User not found");

    return friendRepository.getFriendshipByUsers(userId, targetUserId)
  },

  getPendingRequests: async (userId: string) => {
    if(!userId) throw new Error("User not found");
    
    return friendRepository.getPendingRequests(userId);
  },

  rejectFriendRequest: async (userId: string, friendshipId: string) => {
    if(!userId) throw new Error("User not found");

    return friendRepository.deleteFriendship(friendshipId);
  }
};
