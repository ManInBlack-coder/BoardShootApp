// Testide jaoks kohaliku mock andmete hoidla
export interface Folder {
  id: number;
  name: string;
  count: number;
}

export interface File {
  id: number;
  title: string;
  created_at: string;
  type: string;
  size: string;
}

// Mock andmed
let mockFolders: Folder[] = [
  { id: 1, name: "Mata", count: 3 },
  { id: 2, name: "Eesti keel", count: 2 },
  { id: 3, name: "Keemia", count: 3 },
];

let mockFiles: Record<number, File[]> = {
  1: [ // Mata kaust
    { id: 1, title: "Algebra", created_at: "2025-04-05", type: "pdf", size: "2.3 MB" },
    { id: 2, title: "Geomeetria", created_at: "2025-04-05", type: "docx", size: "1.8 MB" },
    { id: 3, title: "Statistika", created_at: "2025-04-05", type: "xlsx", size: "4.5 MB" },
  ],
  2: [ // Eesti keel kaust
    { id: 4, title: "Grammatika", created_at: "2025-04-05", type: "pdf", size: "3.2 MB" },
    { id: 5, title: "Kirjandus", created_at: "2025-04-05", type: "docx", size: "2.1 MB" },
  ],
  3: [ // Keemia kaust
    { id: 6, title: "Elemendid", created_at: "2025-04-05", type: "pdf", size: "5.7 MB" },
    { id: 7, title: "Reaktsioonid", created_at: "2025-04-05", type: "pptx", size: "8.3 MB" },
    { id: 8, title: "Praktikum", created_at: "2025-04-05", type: "docx", size: "1.2 MB" },
  ],
};

let nextFolderId = 4;
let nextFileId = 9;

// Teenused
export const getFolders = async (): Promise<Folder[]> => {
  // Simuleerime võrgulatentsust
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockFolders];
};

export const getFiles = async (folderId: number): Promise<File[]> => {
  // Simuleerime võrgulatentsust
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockFiles[folderId] || [];
};

export const createFolder = async (name: string): Promise<Folder> => {
  // Simuleerime võrgulatentsust
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newFolder: Folder = {
    id: nextFolderId++,
    name,
    count: 0
  };
  
  mockFolders.push(newFolder);
  mockFiles[newFolder.id] = [];
  
  return newFolder;
};

export const createFile = async (folderId: number, title: string, content: string): Promise<File> => {
  // Simuleerime võrgulatentsust
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newFile: File = {
    id: nextFileId++,
    title,
    created_at: new Date().toISOString().split('T')[0],
    type: 'txt',
    size: `${(content.length / 1024).toFixed(1)} KB`
  };
  
  if (!mockFiles[folderId]) {
    mockFiles[folderId] = [];
  }
  
  mockFiles[folderId].push(newFile);
  
  // Uuendame ka kausta failide arvu
  const folderIndex = mockFolders.findIndex(f => f.id === folderId);
  if (folderIndex !== -1) {
    mockFolders[folderIndex].count += 1;
  }
  
  return newFile;
}; 