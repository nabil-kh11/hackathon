// lib/services/auth_service.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

class AuthService {
  // Secure storage instance
  static const _storage = FlutterSecureStorage();

  // Keys for storage
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _userTypeKey = 'user_type'; // ✅ NOUVEAU
  static const String _childDataKey = 'child_data'; // ✅ NOUVEAU

  // Save login data (Parent - token + user info)
  static Future<void> saveLoginData({
    required String token,
    required Map<String, dynamic> userData,
  }) async {
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _userKey, value: jsonEncode(userData));
    await _storage.write(key: _userTypeKey, value: 'parent');
    print('✅ Parent token saved securely');
  }

  // ✅ NOUVEAU: Save child data (no token)
  static Future<void> saveChildData(Map<String, dynamic> childData) async {
    await _storage.write(key: _childDataKey, value: jsonEncode(childData));
    await _storage.write(key: _userTypeKey, value: 'child');
    print('✅ Child data saved securely');
  }

  // Get token (Parent only)
  static Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // Get user data (Parent)
  static Future<Map<String, dynamic>?> getUserData() async {
    final userData = await _storage.read(key: _userKey);
    if (userData != null) {
      return jsonDecode(userData);
    }
    return null;
  }

  // ✅ NOUVEAU: Get child data
  static Future<Map<String, dynamic>?> getChildData() async {
    final childData = await _storage.read(key: _childDataKey);
    if (childData != null) {
      return jsonDecode(childData);
    }
    return null;
  }

  // ✅ NOUVEAU: Get user type
  static Future<String?> getUserType() async {
    return await _storage.read(key: _userTypeKey);
  }

  // Check if user is logged in (Parent or Child)
  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    final childData = await getChildData();
    return (token != null && token.isNotEmpty) || childData != null;
  }

  // Logout (clear all data - works for both Parent and Child)
  static Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userKey);
    await _storage.delete(key: _childDataKey);
    await _storage.delete(key: _userTypeKey);
    print('✅ Logged out - all data cleared');
  }

  // Clear all storage (for debugging)
  static Future<void> clearAll() async {
    await _storage.deleteAll();
    print('✅ All storage cleared');
  }
}