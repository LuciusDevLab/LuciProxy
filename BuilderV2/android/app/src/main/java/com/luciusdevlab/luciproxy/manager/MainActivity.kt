package com.luciusdevlab.luciproxy.manager

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*
import com.luciusdevlab.luciproxy.manager.ui.navigation.Screen
import com.luciusdevlab.luciproxy.manager.ui.screens.*
import com.luciusdevlab.luciproxy.manager.ui.theme.LuciProxyTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val app = application as LuciProxyApplication

        setContent {
            LuciProxyTheme {
                val navController = rememberNavController()
                val currentBackStack by navController.currentBackStackEntryAsState()
                val currentRoute = currentBackStack?.destination?.route ?: Screen.Home.route

                val workers by app.localRepository.workers.collectAsState()
                val connections by app.localRepository.connections.collectAsState()

                Scaffold(
                    bottomBar = {
                        NavigationBar {
                            val items = listOf(
                                Screen.Home to Icons.Default.Home,
                                Screen.Workers to Icons.Default.Layers,
                                Screen.D1 to Icons.Default.Storage,
                                Screen.Accounts to Icons.Default.AccountCircle,
                                Screen.Analytics to Icons.Default.Analytics,
                                Screen.Settings to Icons.Default.Settings
                            )
                            items.forEach { (screen, icon) ->
                                NavigationBarItem(
                                    selected = currentRoute == screen.route,
                                    onClick = {
                                        navController.navigate(screen.route) {
                                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                                            launchSingleTop = true
                                            restoreState = true
                                        }
                                    },
                                    icon = { Icon(icon, contentDescription = screen.title) },
                                    label = { Text(screen.title) }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Home.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable(Screen.Home.route) {
                            HomeScreen(
                                onCreateWorkerClick = { navController.navigate(Screen.Workers.route) },
                                onUpdateWorkerClick = { navController.navigate(Screen.Workers.route) }
                            )
                        }
                        composable(Screen.Workers.route) {
                            WorkersScreen(
                                workers = workers,
                                onUpdateWorker = { /* Triggers WorkerInstaller update */ }
                            )
                        }
                        composable(Screen.D1.route) {
                            D1Screen()
                        }
                        composable(Screen.Accounts.route) {
                            AccountsScreen(
                                connections = connections,
                                onAddConnectionClick = { /* Opens Add Connection dialog */ }
                            )
                        }
                        composable(Screen.Analytics.route) {
                            AnalyticsScreen()
                        }
                        composable(Screen.Settings.route) {
                            SettingsScreen(
                                onPurgeDataClick = {
                                    app.credentialStore.deleteAllTokens()
                                    app.localRepository.clearAll()
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
