export type RootStackParamList = {
    Home: undefined;
    SignUp: undefined;
    SignIn: undefined;
    Camera: undefined;
    Settings: undefined;
    Folders: undefined;
    CameraScreen: undefined;
    MainScreen: undefined;
    Files: {
        folderId: number;
        folderName: string;
    };
    Document: {
        folderId: number;
        noteId: number;
        title: string;
    };
    DocumentView: undefined;
};

export default RootStackParamList;
  