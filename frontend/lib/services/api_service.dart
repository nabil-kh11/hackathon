import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // FOR CHROME BROWSER - USE LOCALHOST
  static const String baseUrl = 'http://localhost:5000/api';

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
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'name': name,
          'lastName': lastName,
          'email': email,
          'password': password,
          'phoneNumber': phoneNumber ?? '',
        }),
      );

      print('📡 Status: ${response.statusCode}');
      print('📡 Body: ${response.body}');

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

  // Login Parent
  Future<Map<String, dynamic>> loginParent({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/parents/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': data['data'],
          'message': data['message'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Login failed',
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
      print('🏥 Health check: $baseUrl/health');
      final response = await http.get(
        Uri.parse('$baseUrl/health'),
        headers: {'Accept': 'application/json'},
      );
      print('🏥 Health response: ${response.statusCode}');
      return response.statusCode == 200;
    } catch (e) {
      print('🏥 Health error: $e');
      return false;
    }
  }
}