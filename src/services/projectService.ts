import {
    ref,
    set,
    push,
    get,
    remove,
    update,
    query,
    orderByChild,
    equalTo,
    serverTimestamp
} from "firebase/database";
import { database } from "../config/firebase";
import { officialTemplates } from "../data/templates";

// Type definitions
export interface ProjectData {
    title: string;
    html: string;
    css: string;
    js: string;
}

export interface Project extends ProjectData {
    id: string;
    ownerId: string;
    updatedAt: number; // Realtime DB timestamps are numbers (milliseconds)
    isPublic?: boolean; // Whether the project is publicly visible
    isFeatured?: boolean; // Whether the project is featured on user's profile
    // Community publishing fields
    description?: string;
    tags?: string[];
    likes?: number;
    views?: number;
    publishedAt?: number;
}

export interface SaveProjectInput extends ProjectData {
    id?: string; // Optional - if provided, update existing project
}

const PROJECTS_PATH = "projects";

/**
 * Saves a project to Realtime Database.
 * If projectData has an ID, updates the existing node (preserving other fields).
 * If no ID is provided, pushes a new node.
 * 
 * @param userId - The ID of the user who owns the project
 * @param projectData - The project data to save
 * @returns The ID of the saved project
 */
export const saveProject = async (
    userId: string,
    projectData: SaveProjectInput
): Promise<string> => {
    const { id, title, html, css, js } = projectData;

    if (id) {
        // Update existing project - use update() to preserve other fields (isPublic, tags, likes, etc.)
        const projectRef = ref(database, `${PROJECTS_PATH}/${id}`);
        await update(projectRef, {
            title,
            html,
            css,
            js,
            updatedAt: serverTimestamp()
        });
        return id;
    } else {
        // Create new project - use set() with full data including ownerId
        const projectsRef = ref(database, PROJECTS_PATH);
        const newProjectRef = push(projectsRef);
        await set(newProjectRef, {
            title,
            html,
            css,
            js,
            ownerId: userId,
            updatedAt: serverTimestamp()
        });
        return newProjectRef.key!;
    }
};

/**
 * Retrieves all projects for a specific user.
 * 
 * @param userId - The ID of the user whose projects to fetch
 * @returns An array of projects owned by the user
 */
export const getUserProjects = async (userId: string): Promise<Project[]> => {
    const projectsRef = ref(database, PROJECTS_PATH);
    const q = query(
        projectsRef,
        orderByChild("ownerId"),
        equalTo(userId)
    );

    const snapshot = await get(q);
    const projects: Project[] = [];

    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            projects.push({
                id: childSnapshot.key!,
                title: data.title,
                html: data.html,
                css: data.css,
                js: data.js,
                ownerId: data.ownerId,
                updatedAt: data.updatedAt,
                isPublic: data.isPublic ?? false,
                isFeatured: data.isFeatured ?? false
            });
        });
    }

    // Sort by updatedAt descending (client-side sorting since RTDB sorting is limited)
    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
};

/**
 * Retrieves a single project by ID.
 * 
 * @param projectId - The ID of the project to fetch
 * @returns The project data or null if not found
 */
export const getProjectById = async (projectId: string): Promise<Project | null> => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${projectId}`);
    const snapshot = await get(projectRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        return {
            id: projectId,
            title: data.title,
            html: data.html,
            css: data.css,
            js: data.js,
            ownerId: data.ownerId,
            updatedAt: data.updatedAt,
            isPublic: data.isPublic ?? false,
            isFeatured: data.isFeatured ?? false,
            description: data.description || "",
            tags: data.tags || []
        };
    }

    return null;
};

/**
 * Deletes a project from Realtime Database.
 * 
 * @param projectId - The ID of the project to delete
 */
export const deleteProject = async (projectId: string): Promise<void> => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${projectId}`);
    await remove(projectRef);
};

/**
 * Renames a project by updating only the title field.
 * 
 * @param projectId - The ID of the project to rename
 * @param newTitle - The new title for the project
 */
export const renameProject = async (projectId: string, newTitle: string): Promise<void> => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${projectId}`);
    await update(projectRef, {
        title: newTitle,
        updatedAt: serverTimestamp()
    });
};

/**
 * Duplicates an existing project with a new ID and "Copy of" prefix.
 * 
 * @param userId - The ID of the user who owns the project
 * @param originalProject - The project to duplicate
 * @returns The ID of the new duplicated project
 */
export const duplicateProject = async (
    userId: string,
    originalProject: Project
): Promise<string> => {
    const projectsRef = ref(database, PROJECTS_PATH);
    const newProjectRef = push(projectsRef);

    const newTitle = `Copy of ${originalProject.title || "Untitled Project"}`;

    await set(newProjectRef, {
        title: newTitle,
        html: originalProject.html,
        css: originalProject.css,
        js: originalProject.js,
        ownerId: userId,
        updatedAt: serverTimestamp()
    });

    return newProjectRef.key!;
};

/**
 * Forks a template to create a new project for the user.
 * 
 * @param templateId - The ID of the template to fork
 * @param userId - The ID of the user who will own the new project
 * @returns The ID of the newly created project
 * @throws Error if template is not found
 */
export const forkTemplate = async (
    templateId: string,
    userId: string
): Promise<string> => {
    // Find the template by ID
    const template = officialTemplates.find(t => t.id === templateId);

    if (!template) {
        throw new Error(`Template with ID "${templateId}" not found`);
    }

    // Create a new project from the template
    const projectsRef = ref(database, PROJECTS_PATH);
    const newProjectRef = push(projectsRef);

    await set(newProjectRef, {
        title: template.title,
        html: template.html,
        css: template.css,
        js: template.js,
        ownerId: userId,
        updatedAt: serverTimestamp()
    });

    return newProjectRef.key!;
};

/**
 * Toggles the public visibility of a project.
 * 
 * @param projectId - The ID of the project
 * @param isPublic - Whether the project should be publicly visible
 */
export const toggleProjectVisibility = async (
    projectId: string,
    isPublic: boolean
): Promise<void> => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${projectId}`);
    await update(projectRef, {
        isPublic,
        updatedAt: serverTimestamp()
    });
};

/**
 * Toggles the featured status of a project.
 * 
 * @param projectId - The ID of the project
 * @param isFeatured - Whether the project should be featured on user's profile
 */
export const toggleProjectFeatured = async (
    projectId: string,
    isFeatured: boolean
): Promise<void> => {
    const projectRef = ref(database, `${PROJECTS_PATH}/${projectId}`);
    await update(projectRef, {
        isFeatured,
        updatedAt: serverTimestamp()
    });
};

/**
 * Retrieves all featured projects for a specific user.
 * 
 * @param userId - The ID of the user whose featured projects to fetch
 * @returns An array of featured projects owned by the user
 */
export const getFeaturedProjects = async (userId: string): Promise<Project[]> => {
    const projectsRef = ref(database, PROJECTS_PATH);
    const q = query(
        projectsRef,
        orderByChild("ownerId"),
        equalTo(userId)
    );

    const snapshot = await get(q);
    const projects: Project[] = [];

    if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            // Only include projects that are featured
            if (data.isFeatured) {
                projects.push({
                    id: childSnapshot.key!,
                    title: data.title,
                    html: data.html,
                    css: data.css,
                    js: data.js,
                    ownerId: data.ownerId,
                    updatedAt: data.updatedAt,
                    isPublic: data.isPublic ?? false,
                    isFeatured: true
                });
            }
        });
    }

    // Sort by updatedAt descending
    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
};
