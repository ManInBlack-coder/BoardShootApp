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
        folderName: string;
        files: Array<{name: string, size: string, type: string}>;
    };
    DocumentView: undefined;
};

export default RootStackParamList;
  