export interface ProjectFile {
    id: string;
    name: string;
    language: string;
    content: string;
}

export interface ShortLinkData {
    files: ProjectFile[];
    createdAt: number;
}
