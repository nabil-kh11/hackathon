// lib/models/parent_model.dart
class Parent {
  final int id;
  final String name;
  final String lastName;
  final String email;
  final String familyCode;
  final String? phoneNumber;
  final String createdAt;

  Parent({
    required this.id,
    required this.name,
    required this.lastName,
    required this.email,
    required this.familyCode,
    this.phoneNumber,
    required this.createdAt,
  });

  // Create Parent from JSON (API response)
  factory Parent.fromJson(Map<String, dynamic> json) {
    return Parent(
      id: json['id'],
      name: json['name'],
      lastName: json['lastName'],
      email: json['email'],
      familyCode: json['familyCode'],
      phoneNumber: json['phoneNumber'],
      createdAt: json['createdAt'],
    );
  }

  // Convert Parent to JSON (for API requests)
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'lastName': lastName,
      'email': email,
      'familyCode': familyCode,
      'phoneNumber': phoneNumber,
      'createdAt': createdAt,
    };
  }

  // Get full name
  String get fullName => '$name $lastName';
}