// lib/screens/daily_notifications_screen.dart
import 'package:flutter/material.dart';

class DailyNotificationsScreen extends StatefulWidget {
  final int childId;
  final String childName;

  const DailyNotificationsScreen({
    Key? key,
    required this.childId,
    required this.childName,
  }) : super(key: key);

  @override
  State<DailyNotificationsScreen> createState() => _DailyNotificationsScreenState();
}

class _DailyNotificationsScreenState extends State<DailyNotificationsScreen> {
  // TODO: Fetch real data from API
  final List<Map<String, dynamic>> _notifications = [
    {
      'id': 1,
      'title': 'Suspicious message detected',
      'message': 'A potentially harmful message was detected in chat',
      'time': '2 hours ago',
      'severity': 'high',
      'icon': Icons.warning_amber_rounded,
      'read': false,
    },
    {
      'id': 2,
      'title': 'App usage limit reached',
      'message': 'TikTok usage exceeded the daily limit of 2 hours',
      'time': '5 hours ago',
      'severity': 'medium',
      'icon': Icons.timer_outlined,
      'read': false,
    },
    {
      'id': 3,
      'title': 'New friend request',
      'message': 'Unknown contact tried to add your child',
      'time': '1 day ago',
      'severity': 'low',
      'icon': Icons.person_add_outlined,
      'read': true,
    },
    {
      'id': 4,
      'title': 'Bedtime reminder',
      'message': 'Device was used past bedtime (22:30)',
      'time': '1 day ago',
      'severity': 'low',
      'icon': Icons.bedtime_outlined,
      'read': true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Daily Notifications',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
            Text(
              widget.childName,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.orange,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all_rounded),
            onPressed: () {
              // Mark all as read
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('All marked as read')),
              );
            },
            tooltip: 'Mark all as read',
          ),
        ],
      ),
      body: _notifications.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _notifications.length,
        itemBuilder: (context, index) {
          return _buildNotificationCard(_notifications[index]);
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.notifications_none_rounded,
              size: 80,
              color: Colors.orange.shade300,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No Notifications',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'All caught up!',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> notification) {
    final isUnread = !notification['read'];
    final severity = notification['severity'] as String;

    // ✅ FIX: Define colors properly
    Color severityColor;
    Color severityLight;
    Color severityDark;

    switch (severity) {
      case 'high':
        severityColor = Colors.red;
        severityLight = Colors.red.shade400;
        severityDark = Colors.red.shade600;
        break;
      case 'medium':
        severityColor = Colors.orange;
        severityLight = Colors.orange.shade400;
        severityDark = Colors.orange.shade600;
        break;
      default: // low
        severityColor = Colors.blue;
        severityLight = Colors.blue.shade400;
        severityDark = Colors.blue.shade600;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isUnread ? Colors.orange.shade50 : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isUnread ? Colors.orange.shade200 : Colors.grey.shade200,
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          // TODO: Show notification details
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Opening: ${notification['title']}')),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [severityLight, severityDark], // ✅ FIX
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: severityColor.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(
                  notification['icon'] as IconData,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),

              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notification['title'],
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: isUnread ? FontWeight.bold : FontWeight.w600,
                              color: Colors.black87,
                            ),
                          ),
                        ),
                        if (isUnread)
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: Colors.orange.shade600,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      notification['message'],
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade700,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          Icons.access_time_rounded,
                          size: 14,
                          color: Colors.grey.shade500,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          notification['time'],
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}