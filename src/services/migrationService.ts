import { ref, push, set, serverTimestamp } from "firebase/database";
import { database } from "../config/firebase";
import type { Project } from "./projectService";

const PROJECTS_PATH = "projects";

/**
 * Result of the migration operation
 */
export interface MigrationResult {
    migratedCount: number;
    newIdMap: Record<string, string>; // Maps old local IDs to new cloud IDs
}

/**
 * Migrates all local projects from localStorage to Firebase Realtime Database.
 * This is typically called when a guest user signs in for the first time.
 * 
 * @param userId - The authenticated user's ID
 * @returns Migration result with count and ID mapping
 */
export const migrateLocalProjects = async (userId: string): Promise<MigrationResult> => {
    const newIdMap: Record<string, string> = {};
    let migratedCount = 0;

    // Step 1: Scan localStorage for all local projects
    const localProjectKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("project-local-")) {
            localProjectKeys.push(key);
        }
    }

    // Step 2: Migrate each local project
    for (const key of localProjectKeys) {
        try {
            const projectData = localStorage.getItem(key);
            if (!projectData) continue;

            const localProject: Project = JSON.parse(projectData);
            const oldLocalId = localProject.id;

            // Generate a new Cloud ID
            const projectsRef = ref(database, PROJECTS_PATH);
            const newProjectRef = push(projectsRef);
            const newCloudId = newProjectRef.key;

            if (!newCloudId) {
                console.error(`Failed to generate cloud ID for ${oldLocalId}`);
                continue;
            }

            // Prepare the data for cloud storage
            const cloudProjectData = {
                title: localProject.title,
                html: localProject.html,
                css: localProject.css,
                js: localProject.js,
                ownerId: userId, // Update to authenticated user
                updatedAt: serverTimestamp(),
                isPublic: false, // Default to private
                description: localProject.description || "",
                tags: localProject.tags || []
            };

            // Step 3: Write to Firebase Realtime Database
            await set(ref(database, `${PROJECTS_PATH}/${newCloudId}`), cloudProjectData);

            // Step 4: Delete from localStorage after successful migration
            localStorage.removeItem(key);

            // Track the migration
            newIdMap[oldLocalId] = newCloudId;
            migratedCount++;

            console.log(`✓ Migrated ${oldLocalId} → ${newCloudId}`);
        } catch (error) {
            console.error(`Failed to migrate project ${key}:`, error);
            // Continue with other projects even if one fails
        }
    }

    return {
        migratedCount,
        newIdMap
    };
};

/**
 * Checks if there are any local projects that need migration.
 * 
 * @returns True if local projects exist, false otherwise
 */
export const hasLocalProjects = (): boolean => {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("project-local-")) {
            return true;
        }
    }
    return false;
};

/**
 * Gets the count of local projects that can be migrated.
 * 
 * @returns Number of local projects
 */
export const getLocalProjectCount = (): number => {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("project-local-")) {
            count++;
        }
    }
    return count;
};
