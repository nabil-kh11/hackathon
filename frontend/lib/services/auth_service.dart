// lib/services/auth_service.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class AuthService {
  // Secure storage instance
  static const _storage = FlutterSecureStorage();

  // Keys for storage
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // Save login data (token + user info)
  static Future<void> saveLoginData({
    required String token,
    required Map<String, dynamic> userData,
  }) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userKey, value: jsonEncode(userData));
    print('✅ Token saved securely');
  }

  // Get token
  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // Get user data
  static Future<Map<String, dynamic>?> getUserData() async {
    final userData = await _storage.read(key: _userKey);
    if (userData != null) {
      return jsonDecode(userData);
    }
    return null;
  }

  // Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Logout (clear all data)
  static Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userKey);
    print('✅ Logged out - token cleared');
  }

  // Clear all storage (for debugging)
  static Future<void> clearAll() async {
    await _storage.deleteAll();
    print('✅ All storage cleared');
  }
}