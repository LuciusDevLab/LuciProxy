"""
LuciProxy Builder - Modern Dark Theme Stylesheet for PySide6.
"""

DARK_THEME = """
QWidget {
    background-color: #12141a;
    color: #e5e7eb;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 13px;
}

/* Main Window */
QMainWindow {
    background-color: #12141a;
}

/* Headings */
QLabel#title {
    font-size: 24px;
    font-weight: 700;
    color: #f9fafb;
    margin-bottom: 4px;
}

QLabel#subtitle {
    font-size: 14px;
    color: #9ca3af;
    margin-bottom: 16px;
}

QLabel#section_heading {
    font-size: 15px;
    font-weight: 600;
    color: #f3f4f6;
    margin-top: 8px;
    margin-bottom: 4px;
}

/* Cards & Containers */
QFrame#card {
    background-color: #1c1f26;
    border: 1px solid #2d333f;
    border-radius: 10px;
    padding: 16px;
}

QFrame#card_highlight {
    background-color: #182234;
    border: 1px solid #2563eb;
    border-radius: 10px;
    padding: 16px;
}

/* Buttons */
QPushButton {
    background-color: #2b303c;
    color: #f3f4f6;
    border: 1px solid #3b4252;
    border-radius: 6px;
    padding: 9px 18px;
    font-weight: 600;
    font-size: 13px;
    min-height: 20px;
}

QPushButton:hover {
    background-color: #373e4e;
    border-color: #4c566a;
}

QPushButton:pressed {
    background-color: #242832;
}

QPushButton:disabled {
    background-color: #181a20;
    color: #4b5563;
    border-color: #262932;
}

/* Primary Action Buttons */
QPushButton#primary_button {
    background-color: #2563eb;
    color: #ffffff;
    border: 1px solid #3b82f6;
    border-radius: 6px;
    padding: 10px 22px;
    font-weight: 600;
    font-size: 14px;
}

QPushButton#primary_button:hover {
    background-color: #1d4ed8;
    border-color: #2563eb;
}

QPushButton#primary_button:pressed {
    background-color: #1e40af;
}

QPushButton#primary_button:disabled {
    background-color: #1e3a5f;
    color: #60a5fa;
    border-color: #1d4ed8;
    opacity: 0.6;
}

/* Secondary Action Buttons */
QPushButton#secondary_button {
    background-color: transparent;
    color: #9ca3af;
    border: 1px solid #374151;
}

QPushButton#secondary_button:hover {
    background-color: #1f2937;
    color: #f3f4f6;
    border-color: #4b5563;
}

/* Action Links / Text Buttons */
QPushButton#link_button {
    background-color: transparent;
    color: #60a5fa;
    border: none;
    padding: 4px 8px;
    font-weight: 500;
    text-decoration: underline;
}

QPushButton#link_button:hover {
    color: #93c5fd;
}

/* Text Inputs */
QLineEdit {
    background-color: #16181f;
    color: #f3f4f6;
    border: 1px solid #374151;
    border-radius: 6px;
    padding: 9px 12px;
    font-size: 13px;
    selection-background-color: #2563eb;
    selection-color: #ffffff;
}

QLineEdit:focus {
    border: 1px solid #3b82f6;
    background-color: #1a1e27;
}

/* Checkboxes & Radios */
QCheckBox, QRadioButton {
    color: #e5e7eb;
    spacing: 8px;
    font-size: 13px;
}

QCheckBox::indicator, QRadioButton::indicator {
    width: 18px;
    height: 18px;
    border: 1px solid #4b5563;
    border-radius: 4px;
    background-color: #16181f;
}

QRadioButton::indicator {
    border-radius: 9px;
}

QCheckBox::indicator:checked, QRadioButton::indicator:checked {
    background-color: #2563eb;
    border-color: #3b82f6;
}

/* Progress Bar */
QProgressBar {
    background-color: #1a1e27;
    border: 1px solid #2d333f;
    border-radius: 6px;
    height: 12px;
    text-align: center;
    color: transparent;
}

QProgressBar::chunk {
    background-color: #2563eb;
    border-radius: 5px;
}

/* Scroll Areas & Tables */
QScrollArea {
    background-color: transparent;
    border: none;
}

QScrollBar:vertical {
    background: #12141a;
    width: 10px;
    margin: 0px;
}

QScrollBar::handle:vertical {
    background: #2d333f;
    min-height: 20px;
    border-radius: 5px;
}

QScrollBar::handle:vertical:hover {
    background: #3b4252;
}

QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0px;
}

QTableWidget {
    background-color: #16181f;
    alternate-background-color: #1a1d26;
    color: #e5e7eb;
    border: 1px solid #2d333f;
    border-radius: 8px;
    gridline-color: #262a34;
    selection-background-color: #1e3a5f;
    selection-color: #f3f4f6;
}

QHeaderView::section {
    background-color: #1f232d;
    color: #9ca3af;
    padding: 8px;
    border: none;
    border-bottom: 1px solid #2d333f;
    font-weight: 600;
}

/* Status Badges & Alerts */
QLabel#badge_success {
    background-color: #064e3b;
    color: #34d399;
    border: 1px solid #059669;
    border-radius: 4px;
    padding: 3px 8px;
    font-weight: 600;
    font-size: 11px;
}

QLabel#badge_warning {
    background-color: #78350f;
    color: #fbbf24;
    border: 1px solid #d97706;
    border-radius: 4px;
    padding: 3px 8px;
    font-weight: 600;
    font-size: 11px;
}

QLabel#badge_error {
    background-color: #7f1d1d;
    color: #f87171;
    border: 1px solid #dc2626;
    border-radius: 4px;
    padding: 3px 8px;
    font-weight: 600;
    font-size: 11px;
}

QLabel#info_box {
    background-color: #1e2430;
    border-left: 3px solid #3b82f6;
    color: #93c5fd;
    padding: 10px 14px;
    border-radius: 4px;
    font-size: 12px;
}
"""
