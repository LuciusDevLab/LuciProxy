package com.luciusdevlab.luciproxy.manager.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Home : Screen("home", "Home")
    object Workers : Screen("workers", "Workers")
    object D1 : Screen("d1", "D1 Databases")
    object Accounts : Screen("accounts", "Accounts")
    object Analytics : Screen("analytics", "Analytics")
    object Settings : Screen("settings", "Settings")
}
