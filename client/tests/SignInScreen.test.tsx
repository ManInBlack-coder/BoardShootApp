import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInScreen from '../app/pages/Starting/SignInScreen';
import * as authService from '../app/services/authService';

// Mock navigeerimist
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

// Mock Alert komponenti
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock authService
jest.mock('../app/services/authService', () => ({
  login: jest.fn(),
}));

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderdab ekraani korrektselt', () => {
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);
    
    // Kontrollime, et vajalikud elemendid on olemas
    expect(getByText('BOARDSHOOT')).toBeTruthy();
    expect(getByText('Kasutajanimi')).toBeTruthy();
    expect(getByText('Parool')).toBeTruthy();
    expect(getByPlaceholderText('Sinu kasutajanimi')).toBeTruthy();
    expect(getByPlaceholderText('••••••••••')).toBeTruthy();
    expect(getByText('Logi sisse')).toBeTruthy();
    expect(getByText('Puudub konto?')).toBeTruthy();
    expect(getByText('Registreeri')).toBeTruthy();
  });

  test('näitab viga, kui väljad on tühjad', () => {
    const { getByText } = render(<SignInScreen />);
    
    // Vajutame sisselogimise nupule ilma välju täitmata
    fireEvent.press(getByText('Logi sisse'));
    
    // Kontrollime, et näidati veateadet
    expect(Alert.alert).toHaveBeenCalledWith('Viga', 'Palun täida kõik väljad');
  });

  test('kutsub välja login meetodi korrektsete andmetega', async () => {
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);
    
    // Täidame väljad
    fireEvent.changeText(getByPlaceholderText('Sinu kasutajanimi'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('••••••••••'), 'password123');
    
    // Mockime õnnestunud sisselogimist
    (authService.login as jest.Mock).mockResolvedValueOnce({
      id: 1, 
      username: 'testuser',
      email: 'test@example.com'
    });
    
    // Vajutame sisselogimise nupule
    fireEvent.press(getByText('Logi sisse'));
    
    // Kontrollime, et login meetodit kutsuti õigete parameetritega
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
    });
    
    // Kontrollime, et navigeeriti peaekraanile
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('MainScreen');
    });
  });

  test('käsitleb sisselogimise viga korrektselt', async () => {
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);
    
    // Täidame väljad
    fireEvent.changeText(getByPlaceholderText('Sinu kasutajanimi'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('••••••••••'), 'wrongpassword');
    
    // Mockime sisselogimise viga
    const error = new Error('Vale kasutajanimi või parool');
    (authService.login as jest.Mock).mockRejectedValueOnce(error);
    
    // Vajutame sisselogimise nupule
    fireEvent.press(getByText('Logi sisse'));
    
    // Kontrollime, et näidati veateadet
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Viga sisselogimisel', 'Vale kasutajanimi või parool');
    });
    
    // Kontrollime, et ei navigeeritud
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('lülitab salasõna nähtavust', () => {
    const { getByPlaceholderText, getByTestId } = render(<SignInScreen />);
    
    // Leia parooliväli ja "silma" ikoon
    const passwordInput = getByPlaceholderText('••••••••••');
    const eyeIcon = getByTestId('eye-outline');
    
    // Kontrollime, et algselt on parool peidetud
    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    // Vajutame silmaikooni
    fireEvent.press(eyeIcon);
    
    // Kontrollime, et parool on nüüd nähtav
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  test('navigeerib registreerimise lehele Registreeri nuppu vajutades', () => {
    const { getByText } = render(<SignInScreen />);
    
    // Vajutame registreerimise lingile
    fireEvent.press(getByText('Registreeri'));
    
    // Kontrollime, et navigeeriti SignUp lehele
    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });

  test('navigeerib tagasi kodulehele Back nuppu vajutades', () => {
    const { getByText } = render(<SignInScreen />);
    
    // Vajutame Back nupule
    fireEvent.press(getByText('Back'));
    
    // Kontrollime, et navigeeriti Home lehele
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });
}); 