// lib/screens/game_notifications_screen.dart
import 'package:flutter/material.dart';

class GameNotificationsScreen extends StatefulWidget {
  final int childId;
  final String childName;

  const GameNotificationsScreen({
    Key? key,
    required this.childId,
    required this.childName,
  }) : super(key: key);

  @override
  State<GameNotificationsScreen> createState() => _GameNotificationsScreenState();
}

class _GameNotificationsScreenState extends State<GameNotificationsScreen> {
  // TODO: Fetch real data from API
  final List<Map<String, dynamic>> _gameAlerts = [
    {
      'id': 1,
      'game': 'Free Fire',
      'alert': 'Toxic language detected',
      'transcript': 'Tu es nul, je vais te frapper idiot',
      'toxicity': 0.89,
      'time': '30 minutes ago',
      'severity': 'high',
      'categories': ['threat', 'insult'],
    },
    {
      'id': 2,
      'game': 'PUBG Mobile',
      'alert': 'Inappropriate conversation',
      'transcript': 'T\'es trop nul au jeu, arrête',
      'toxicity': 0.65,
      'time': '2 hours ago',
      'severity': 'medium',
      'categories': ['insult'],
    },
    {
      'id': 3,
      'game': 'Free Fire',
      'alert': 'Session duration exceeded',
      'transcript': 'Played for 3 hours straight',
      'toxicity': 0.0,
      'time': '5 hours ago',
      'severity': 'low',
      'categories': ['screen_time'],
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
              'Game Notifications',
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
        backgroundColor: Colors.purple,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: () {
              // TODO: Filter options
            },
            tooltip: 'Filter',
          ),
        ],
      ),
      body: _gameAlerts.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _gameAlerts.length,
        itemBuilder: (context, index) {
          return _buildGameAlertCard(_gameAlerts[index]);
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
              color: Colors.purple.shade50,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.sports_esports_outlined,
              size: 80,
              color: Colors.purple.shade300,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No Game Alerts',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'All gaming sessions are safe!',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGameAlertCard(Map<String, dynamic> alert) {
    final severity = alert['severity'] as String;
    final toxicity = alert['toxicity'] as double;

    // ✅ FIX: Define colors properly
    Color severityColor;
    Color severityLight;
    Color severityDark;
    IconData severityIcon;

    switch (severity) {
      case 'high':
        severityColor = Colors.red;
        severityLight = Colors.red.shade400;
        severityDark = Colors.red.shade600;
        severityIcon = Icons.error_rounded;
        break;
      case 'medium':
        severityColor = Colors.orange;
        severityLight = Colors.orange.shade400;
        severityDark = Colors.orange.shade600;
        severityIcon = Icons.warning_rounded;
        break;
      default: // low
        severityColor = Colors.blue;
        severityLight = Colors.blue.shade400;
        severityDark = Colors.blue.shade600;
        severityIcon = Icons.info_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: severityColor.withOpacity(0.3),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [severityLight, severityDark], // ✅ FIX
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
              ),
            ),
            child: Row(
              children: [
                Icon(severityIcon, color: Colors.white, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        alert['game'],
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        alert['alert'],
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    severity.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Transcript
                if (toxicity > 0) ...[
                  const Text(
                    'Detected Content:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.red.shade200,
                        width: 1,
                      ),
                    ),
                    child: Text(
                      alert['transcript'],
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade800,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Toxicity Score
                  Row(
                    children: [
                      const Text(
                        'Toxicity Score:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: LinearProgressIndicator(
                            value: toxicity,
                            backgroundColor: Colors.grey.shade200,
                            color: severityColor,
                            minHeight: 8,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${(toxicity * 100).toInt()}%',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: severityColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Categories
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: (alert['categories'] as List<dynamic>).map((cat) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: severityColor.withOpacity(0.1), // ✅ FIX: Use severityColor
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          cat.toString().toUpperCase(),
                          style: TextStyle(
                            color: severityDark, // ✅ FIX: Use severityDark
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ] else ...[
                  Text(
                    alert['transcript'],
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ],

                const SizedBox(height: 16),

                // Time and Actions
                Row(
                  children: [
                    Icon(
                      Icons.access_time_rounded,
                      size: 14,
                      color: Colors.grey.shade500,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      alert['time'],
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade500,
                      ),
                    ),
                    const Spacer(),
                    TextButton.icon(
                      onPressed: () {
                        // TODO: View details
                      },
                      icon: const Icon(Icons.visibility_outlined, size: 16),
                      label: const Text('View Details'),
                      style: TextButton.styleFrom(
                        foregroundColor: Colors.purple,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}