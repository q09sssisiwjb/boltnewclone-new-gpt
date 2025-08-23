import { v } from 'convex/values';
import { mutation, query } from "./_generated/server";

export const CreateWorkSpace = mutation({
  args: {
    message: v.any(),
    user: v.id("users")
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.user);
      if (!user) {
        throw new Error("User not found");
      }
      const workSpaceId = await ctx.db.insert("workspaces", {
        message: args.message,
        user: args.user
      });

      return workSpaceId;
    } catch (error) {
      console.log("Error creating workspace:", error);
      throw new Error("Failed to create workspace");
    }
  }
})

export const GetUserWorkSpace = query({
  args: {
    workspaceId: v.id('workspaces')
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.workspaceId);
    return result;
  }
})

export const UpdateMessages = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    message: v.any()
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.workspaceId, { message: args.message })
    return result;
  }
})

export const UpdateFiles = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    fileData: v.any()
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.workspaceId, { fileData: args.fileData })
    return result;
  }
})
