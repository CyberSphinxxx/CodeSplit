import { useState, useEffect, useCallback } from "react";
import { getUserProfile, type UserProfile } from "../services/userService";
import { getFeaturedProjects, getUserProjects, type Project } from "../services/projectService";

export interface LanguageStats {
    html: number;
    css: number;
    js: number;
    total: number;
}

export interface UseProfileResult {
    profile: UserProfile | null;
    featuredProjects: Project[];
    allProjects: Project[];
    languageStats: LanguageStats;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Calculate language statistics from project code
 */
function calculateLanguageStats(projects: Project[]): LanguageStats {
    let html = 0;
    let css = 0;
    let js = 0;

    for (const project of projects) {
        html += (project.html || "").length;
        css += (project.css || "").length;
        js += (project.js || "").length;
    }

    const total = html + css + js;
    return { html, css, js, total };
}

/**
 * Custom hook to fetch a user's profile and their projects.
 * 
 * @param userId - The ID of the user to fetch profile for
 * @returns Object containing profile, projects, language stats, loading state, and error
 */
export function useProfile(userId: string | null | undefined): UseProfileResult {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [languageStats, setLanguageStats] = useState<LanguageStats>({ html: 0, css: 0, js: 0, total: 0 });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!userId) {
            setProfile(null);
            setFeaturedProjects([]);
            setAllProjects([]);
            setLanguageStats({ html: 0, css: 0, js: 0, total: 0 });
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch profile first - this is critical
            const userProfile = await getUserProfile(userId);
            setProfile(userProfile);

            // Attempt to fetch projects - may fail for public viewers due to permissions
            try {
                const [featured, all] = await Promise.all([
                    getFeaturedProjects(userId),
                    getUserProjects(userId)
                ]);
                setFeaturedProjects(featured);
                setAllProjects(all);
                setLanguageStats(calculateLanguageStats(all));
            } catch (projectsErr) {
                // Projects fetch failed (likely permission denied for public viewers)
                // This is expected for unauthenticated users viewing public profiles
                console.warn("Could not fetch projects (may require authentication):", projectsErr);
                setFeaturedProjects([]);
                setAllProjects([]);
                setLanguageStats({ html: 0, css: 0, js: 0, total: 0 });
            }
        } catch (err) {
            console.error("Error fetching profile data:", err);
            setError(err instanceof Error ? err : new Error("Failed to fetch profile"));
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        profile,
        featuredProjects,
        allProjects,
        languageStats,
        loading,
        error,
        refetch: fetchData
    };
}

export default useProfile;

