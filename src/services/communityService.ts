import {
    ref,
    get,
    set,
    update,
    query,
    orderByChild,
    limitToLast,
    runTransaction,
    serverTimestamp
} from "firebase/database";
import { database } from "../config/firebase";
import type { Project } from "./projectService";
import { getUserProfile } from "./userService";

const PROJECTS_PATH = "projects";

// Type definitions
export interface PublishMetadata {
    description: string;
    tags: string[];
}

export interface CommunityProject extends Project {
    ownerName?: string;
    ownerPhotoURL?: string;
    ownerUsername?: string;
}

export interface LikeResult {
    liked: boolean;
    likeCount: number;
}

/**
 * Publishes a project to the community feed.
 * Sets isPublic to true and adds community metadata.
 * 
 * @param projectId - The ID of the project to publish
 * @param userId - The ID of the user publishing the project (for ownership verification)
 * @param metadata - The description and tags for the project
 * @throws Error if project doesn't exist or user doesn't own it
 */
export const publishProject = async (
    projectId: string,
    userId: string,
    metadata: PublishMetadata
): Promise<void> => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${projectId}`);
    const snapshot = await get(projectRef);

    if (!snapshot.exists()) {
        throw new Error("Project not found");
    }

    const projectData = snapshot.val();

    // Verify ownership
    if (projectData.ownerId !== userId) {
        throw new Error("You don't have permission to publish this project");
    }

    // Update with community metadata
    await update(projectRef, {
        isPublic: true,
        description: metadata.description,
        tags: metadata.tags,
        likes: projectData.likes ?? 0,
        views: projectData.views ?? 0,
        publishedAt: projectData.publishedAt ?? serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

/**
 * Updates a published project's metadata.
 * 
 * @param projectId - The ID of the project to update
 * @param userId - The ID of the user (for ownership verification)
 * @param data - The fields to update (title, description, tags)
 * @throws Error if project doesn't exist or user doesn't own it
 */
export const updatePublishedProject = async (
    projectId: string,
    userId: string,
    data: {
        title?: string;
        description?: string;
        tags?: string[];
    }
): Promise<void> => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${projectId}`);
    const snapshot = await get(projectRef);

    if (!snapshot.exists()) {
        throw new Error("Project not found");
    }

    const projectData = snapshot.val();

    if (projectData.ownerId !== userId) {
        throw new Error("You don't have permission to update this project");
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp()
    };

    if (data.title !== undefined) {
        updateData.title = data.title;
    }
    if (data.description !== undefined) {
        updateData.description = data.description;
    }
    if (data.tags !== undefined) {
        updateData.tags = data.tags;
    }

    await update(projectRef, updateData);
};

/**
 * Unpublishes a project from the community feed.
 * Sets isPublic to false and clears publishedAt.
 * 
 * @param projectId - The ID of the project to unpublish
 * @param userId - The ID of the user (for ownership verification)
 */
export const unpublishProject = async (
    projectId: string,
    userId: string
): Promise<void> => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${projectId}`);
    const snapshot = await get(projectRef);

    if (!snapshot.exists()) {
        throw new Error("Project not found");
    }

    const projectData = snapshot.val();

    if (projectData.ownerId !== userId) {
        throw new Error("You don't have permission to unpublish this project");
    }

    await update(projectRef, {
        isPublic: false,
        publishedAt: null,
        updatedAt: serverTimestamp()
    });
};

/**
 * Retrieves community projects with filtering.
 * 
 * @param filter - 'newest' orders by publishedAt, 'trending' orders by likes
 * @returns Array of public projects with owner information
 */
export const getCommunityProjects = async (
    filter: 'trending' | 'newest'
): Promise<CommunityProject[]> => {
    const projectsRef = ref(database, PROJECTS_PATH);

    // Query all projects and filter client-side
    // (Realtime DB can only orderBy one field at a time, so we filter isPublic client-side)
    const q = query(
        projectsRef,
        orderByChild(filter === 'newest' ? 'publishedAt' : 'likes'),
        limitToLast(50) // Fetch more than needed, then filter
    );

    const snapshot = await get(q);
    const projects: CommunityProject[] = [];

    if (snapshot.exists()) {
        const projectPromises: Promise<CommunityProject | null>[] = [];

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();

            // Only include public projects
            if (data.isPublic) {
                const projectPromise = (async () => {
                    // Fetch owner info
                    const ownerProfile = await getUserProfile(data.ownerId);

                    return {
                        id: childSnapshot.key!,
                        title: data.title,
                        html: data.html,
                        css: data.css,
                        js: data.js,
                        ownerId: data.ownerId,
                        updatedAt: data.updatedAt,
                        isPublic: true,
                        isFeatured: data.isFeatured ?? false,
                        description: data.description || "",
                        tags: data.tags || [],
                        likes: data.likes ?? 0,
                        views: data.views ?? 0,
                        publishedAt: data.publishedAt,
                        ownerName: ownerProfile?.displayName || "Anonymous",
                        ownerPhotoURL: ownerProfile?.photoURL || "",
                        ownerUsername: ownerProfile?.username || ""
                    } as CommunityProject;
                })();

                projectPromises.push(projectPromise);
            }
        });

        const resolvedProjects = await Promise.all(projectPromises);
        projects.push(...resolvedProjects.filter((p): p is CommunityProject => p !== null));
    }

    // Sort based on filter
    if (filter === 'newest') {
        projects.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
    } else {
        projects.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    }

    // Limit to 20
    return projects.slice(0, 20);
};

/**
 * Retrieves a user's published projects.
 * 
 * @param userId - The ID of the user whose projects to fetch
 * @returns Array of the user's public projects with owner information
 */
export const getUserPublishedProjects = async (
    userId: string
): Promise<CommunityProject[]> => {
    const projectsRef = ref(database, PROJECTS_PATH);

    // Query projects by ownerId
    const q = query(
        projectsRef,
        orderByChild('ownerId'),
        limitToLast(50)
    );

    const snapshot = await get(q);
    const projects: CommunityProject[] = [];

    if (snapshot.exists()) {
        const ownerProfile = await getUserProfile(userId);

        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();

            // Only include public projects owned by this user
            if (data.isPublic && data.ownerId === userId) {
                projects.push({
                    id: childSnapshot.key!,
                    title: data.title,
                    html: data.html,
                    css: data.css,
                    js: data.js,
                    ownerId: data.ownerId,
                    updatedAt: data.updatedAt,
                    isPublic: true,
                    isFeatured: data.isFeatured ?? false,
                    description: data.description || "",
                    tags: data.tags || [],
                    likes: data.likes ?? 0,
                    views: data.views ?? 0,
                    publishedAt: data.publishedAt,
                    ownerName: ownerProfile?.displayName || "Anonymous",
                    ownerPhotoURL: ownerProfile?.photoURL || "",
                    ownerUsername: ownerProfile?.username || ""
                } as CommunityProject);
            }
        });
    }

    // Sort by publishedAt descending
    projects.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));

    return projects;
};

/**
 * Checks if a user has liked a project.
 * 
 * @param projectId - The ID of the project
 * @param userId - The ID of the user
 * @returns True if the user has liked the project
 */
export const hasUserLikedProject = async (
    projectId: string,
    userId: string
): Promise<boolean> => {
    const likeRef = ref(database, `${PROJECTS_PATH}/${projectId}/likes_by/${userId}`);
    const snapshot = await get(likeRef);
    return snapshot.exists();
};

/**
 * Toggles a like on a project.
 * Uses a sub-path for one-like-per-user enforcement.
 * Uses transaction for atomic counter updates.
 * 
 * @param projectId - The ID of the project to like/unlike
 * @param userId - The ID of the user performing the action
 * @returns Object with new liked state and like count
 */
export const toggleLikeProject = async (
    projectId: string,
    userId: string
): Promise<LikeResult> => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${projectId}`);
    const likeRef = ref(database, `${PROJECTS_PATH}/${projectId}/likes_by/${userId}`);

    // Check if project exists
    const projectSnapshot = await get(projectRef);
    if (!projectSnapshot.exists()) {
        throw new Error("Project not found");
    }

    // Check if user already liked
    const likeSnapshot = await get(likeRef);
    const hasLiked = likeSnapshot.exists();

    if (hasLiked) {
        // Unlike: Remove the like record
        await set(likeRef, null);

        // Decrement the likes counter using transaction
        const likesCountRef = ref(database, `${PROJECTS_PATH}/${projectId}/likes`);
        const result = await runTransaction(likesCountRef, (currentLikes) => {
            if (currentLikes === null) {
                return 0;
            }
            return Math.max(0, currentLikes - 1);
        });

        return {
            liked: false,
            likeCount: (result.snapshot.val() as number) ?? 0
        };
    } else {
        // Like: Add the like record
        await set(likeRef, {
            likedAt: serverTimestamp()
        });

        // Increment the likes counter using transaction
        const likesCountRef = ref(database, `${PROJECTS_PATH}/${projectId}/likes`);
        const result = await runTransaction(likesCountRef, (currentLikes) => {
            if (currentLikes === null) {
                return 1;
            }
            return currentLikes + 1;
        });

        return {
            liked: true,
            likeCount: (result.snapshot.val() as number) ?? 1
        };
    }
};

/**
 * Increments the view count for a project.
 * Should be called when a project is viewed.
 * 
 * @param projectId - The ID of the project being viewed
 */
export const incrementProjectViews = async (projectId: string): Promise<void> => {
    const viewsRef = ref(database, `${PROJECTS_PATH}/${projectId}/views`);

    await runTransaction(viewsRef, (currentViews) => {
        if (currentViews === null) {
            return 1;
        }
        return currentViews + 1;
    });
};
