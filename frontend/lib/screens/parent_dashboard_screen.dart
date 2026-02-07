// lib/screens/parent_dashboard_screen.dart
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'children_list_screen.dart';
import 'add_child_screen.dart';

class ParentDashboardScreen extends StatefulWidget {
  const ParentDashboardScreen({Key? key}) : super(key: key);

  @override
  State<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends State<ParentDashboardScreen> with SingleTickerProviderStateMixin {
  final _apiService = ApiService();
  Map<String, dynamic>? _userData;
  bool _isLoading = true;
  int _childrenCount = 0;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _fadeAnimation = CurvedAnimation(parent: _animationController, curve: Curves.easeIn);
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final userData = await AuthService.getUserData();
    final dashboardResult = await _apiService.getDashboard();

    setState(() {
      _userData = userData;
      if (dashboardResult['success']) {
        _childrenCount = dashboardResult['data']['childrenCount'] ?? 0;
      }
      _isLoading = false;
    });
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          _buildBackground(),
          _isLoading ? _buildLoader() : _buildContent(),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364)],
        ),
      ),
    );
  }

  Widget _buildLoader() {
    return const Center(child: CircularProgressIndicator(color: Colors.cyanAccent));
  }

  Widget _buildContent() {
    return SafeArea(
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: RefreshIndicator(
          onRefresh: _loadData,
          backgroundColor: const Color(0xFF1A2A3A),
          color: Colors.cyanAccent,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCustomAppBar(),
                const SizedBox(height: 25),
                _buildWelcomeHeader(),
                const SizedBox(height: 25),
                _buildFamilyCodeSection(),
                const SizedBox(height: 25),
                _buildStatsGrid(),
                const SizedBox(height: 30),
                const Text(
                  "ACTIONS RAPIDES",
                  style: TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                ),
                const SizedBox(height: 15),
                _buildQuickActions(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCustomAppBar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Row(
          children: [
            Icon(Icons.shield, color: Colors.cyanAccent, size: 28),
            SizedBox(width: 10),
            Text('SAFEGUARD', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1)),
          ],
        ),
        Row(
          children: [
            _buildCircleButton(Icons.refresh, _loadData),
            const SizedBox(width: 10),
            _buildCircleButton(Icons.logout, _logout, color: Colors.redAccent),
          ],
        ),
      ],
    );
  }

  Widget _buildWelcomeHeader() {
    return _buildGlassContainer(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(3),
            decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.cyanAccent),
            child: const CircleAvatar(radius: 30, backgroundColor: Color(0xFF1A2A3A), child: Icon(Icons.person, color: Colors.white, size: 35)),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("TABLEAU DE BORD", style: TextStyle(color: Colors.cyanAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                Text('${_userData?['name']} ${_userData?['lastName']}', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                Text('${_userData?['email']}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFamilyCodeSection() {
    final familyCode = _userData?['familyCode'] ?? '---';
    return _buildGlassContainer(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const Text("VOTRE CODE FAMILLE UNIQUE", style: TextStyle(color: Colors.white70, fontSize: 12, letterSpacing: 1)),
          const SizedBox(height: 15),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 15),
            decoration: BoxDecoration(
              color: Colors.black26,
              borderRadius: BorderRadius.circular(15),
              border: Border.all(color: Colors.white10),
            ),
            child: Text(
              familyCode,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.cyanAccent, fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: 8),
            ),
          ),
          const SizedBox(height: 15),
          ElevatedButton.icon(
            onPressed: _copyFamilyCode,
            icon: const Icon(Icons.copy, size: 18),
            label: const Text("COPIER LE CODE"),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.cyanAccent.withOpacity(0.1),
              foregroundColor: Colors.cyanAccent,
              side: const BorderSide(color: Colors.cyanAccent),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    return Row(
      children: [
        Expanded(child: _buildStatCard("ENFANTS", _childrenCount.toString(), Icons.child_care, Colors.blueAccent)),
        const SizedBox(width: 15),
        Expanded(child: _buildStatCard("STATUT", _childrenCount == 0 ? "Initial" : "Actif", Icons.verified_user, _childrenCount == 0 ? Colors.orange : Colors.greenAccent)),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return _buildGlassContainer(
      padding: const EdgeInsets.all(15),
      child: Column(
        children: [
          Icon(icon, color: color, size: 30),
          const SizedBox(height: 10),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          Text(title, style: const TextStyle(color: Colors.white54, fontSize: 10)),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      children: [
        _buildActionTile("Mes Enfants", "Gérer et surveiller vos enfants", Icons.people_alt, Colors.cyanAccent, _goToChildren),
        const SizedBox(height: 12),
        _buildActionTile("Ajouter un enfant", "Connecter un nouvel appareil", Icons.person_add, Colors.greenAccent, _goToAddChild),
        const SizedBox(height: 12),
        _buildActionTile("Mon Profil", "Paramètres du compte", Icons.settings, Colors.blueGrey, () {}),
      ],
    );
  }

  Widget _buildActionTile(String title, String subtitle, IconData icon, Color color, VoidCallback onTap) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(15),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
            borderRadius: BorderRadius.circular(15),
          ),
          child: ListTile(
            onTap: onTap,
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color),
            ),
            title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            subtitle: Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 11)),
            trailing: const Icon(Icons.arrow_forward_ios, color: Colors.white24, size: 16),
          ),
        ),
      ),
    );
  }

  // Helper Widgets
  Widget _buildGlassContainer({required Widget child, EdgeInsetsGeometry? padding}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
          ),
          child: child,
        ),
      ),
    );
  }

  Widget _buildCircleButton(IconData icon, VoidCallback onTap, {Color color = Colors.white}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withOpacity(0.05), border: Border.all(color: Colors.white10)),
        child: Icon(icon, color: color, size: 20),
      ),
    );
  }

  // --- Logic remain the same ---
  void _copyFamilyCode() {
    final familyCode = _userData?['familyCode'] ?? '';
    Clipboard.setData(ClipboardData(text: familyCode));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('✅ Code copié !'), backgroundColor: Colors.cyan),
    );
  }

  void _goToChildren() {
    Navigator.push(context, MaterialPageRoute(builder: (context) => const ChildrenListScreen())).then((_) => _loadData());
  }

  void _goToAddChild() async {
    final result = await Navigator.push(context, MaterialPageRoute(builder: (context) => const AddChildScreen()));
    if (result == true) _loadData();
  }

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A2A3A),
        title: const Text('Déconnexion', style: TextStyle(color: Colors.white)),
        content: const Text('Voulez-vous vraiment quitter ?', style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('ANNULER', style: TextStyle(color: Colors.white54))),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('QUITTER', style: TextStyle(color: Colors.redAccent))),
        ],
      ),
    );
    if (confirm == true) {
      await AuthService.logout();
      if (mounted) Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) => const LoginScreen()), (route) => false);
    }
  }
}