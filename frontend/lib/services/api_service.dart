import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart'; // NEW!

class ApiService {
  // For Chrome: localhost, For Android Emulator: 10.0.2.2
  static const String baseUrl = 'http://localhost:5000/api';

  // Get headers with token
  static Future<Map<String, String>> _getHeaders() async {
    final token = await AuthService.getToken();

    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  // Register Parent
  Future<Map<String, dynamic>> registerParent({
    required String name,
    required String lastName,
    required String email,
    required String password,
    String? phoneNumber,
  }) async {
    try {
      print('🚀 Calling: $baseUrl/parents/register');

      final response = await http.post(
        Uri.parse('$baseUrl/parents/register'),
        headers: await _getHeaders(),
        body: jsonEncode({
          'name': name,
          'lastName': lastName,
          'email': email,
          'password': password,
          'phoneNumber': phoneNumber ?? '',
        }),
      );

      print('📡 Status: ${response.statusCode}');
      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return {
          'success': true,
          'data': data['data'],
          'message': data['message'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Registration failed',
        };
      }
    } catch (e) {
      print('❌ Error: $e');
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }

  // Login Parent - NOW SAVES TOKEN!
  Future<Map<String, dynamic>> loginParent({
    required String email,
    required String password,
  }) async {
    try {
      print('🚀 Calling: $baseUrl/parents/login');

      final response = await http.post(
        Uri.parse('$baseUrl/parents/login'),
        headers: await _getHeaders(),
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      print('📡 Status: ${response.statusCode}');
      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // Save token and user data
        final userData = data['data'];
        final token = userData['token'];

        if (token != null) {
          await AuthService.saveLoginData(
            token: token,
            userData: userData,
          );
          print('✅ Token saved: ${token.substring(0, 20)}...');
        }

        return {
          'success': true,
          'data': userData,
          'message': data['message'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Login failed',
        };
      }
    } catch (e) {
      print('❌ Error: $e');
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }

  // Get current user profile (using token)
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final userData = await AuthService.getUserData();
      if (userData == null) {
        return {
          'success': false,
          'message': 'Not logged in',
        };
      }

      final response = await http.get(
        Uri.parse('$baseUrl/parents/${userData['id']}'),
        headers: await _getHeaders(),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to get profile',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: ${e.toString()}',
      };
    }
  }

  // Health Check
  Future<bool> checkHealth() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
        headers: await _getHeaders(),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}