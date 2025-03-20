import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

export default function CameraScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = React.useState<CameraType>('back');
    const [photo, setPhoto] = React.useState<string | null>(null);

    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    if (!permission) {
        return <View />;
    }
    if (!permission.granted) {
        return <Text>Ei ole kaamera õigusi</Text>;
    }

    return (
        <View style={styles.container}>
            <CameraView 
                style={styles.preview} 
                facing={facing}
            >
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))} 
                        style={styles.capture}
                    >
                        <Text style={{ fontSize: 14 }}>SNAP</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    buttonContainer: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
});