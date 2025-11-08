# Abort Delivery - Visual Guide

## Button Appearance

### On "Accepted" Status Screen:
```
┌─────────────────────────────────────┐
│                                     │
│     [START TRIP] (Green, Large)    │
│                                     │
│   [ABORT DELIVERY] (Red, Outlined) │
│                                     │
└─────────────────────────────────────┘
```

### On "Picked Up" Status Screen:
```
┌─────────────────────────────────────┐
│                                     │
│  [COMPLETE DELIVERY] (Yellow, Lg)  │
│                                     │
│   [ABORT DELIVERY] (Red, Outlined) │
│                                     │
└─────────────────────────────────────┘
```

## Dialog Flow

### Step 1: Reason Selection
```
╔═══════════════════════════════════════╗
║         Abort Delivery                ║
╠═══════════════════════════════════════╣
║                                       ║
║  Please select a reason for aborting  ║
║  this delivery:                       ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ 🔧 Vehicle breakdown            │ ║
║  └─────────────────────────────────┘ ║
║  ┌─────────────────────────────────┐ ║
║  │ 🚨 Emergency                    │ ║
║  └─────────────────────────────────┘ ║
║  ┌─────────────────────────────────┐ ║
║  │ 📦 Wrong package                │ ║
║  └─────────────────────────────────┘ ║
║  ┌─────────────────────────────────┐ ║
║  │ ⚠️  Safety concerns              │ ║
║  └─────────────────────────────────┘ ║
║  ┌─────────────────────────────────┐ ║
║  │ ➕ Other                         │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║                      [Cancel]         ║
╚═══════════════════════════════════════╝
```

### Step 2 (If "Other" Selected): Custom Reason
```
╔═══════════════════════════════════════╗
║         Specify Reason                ║
╠═══════════════════════════════════════╣
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ Enter reason...                 │ ║
║  │                                 │ ║
║  │                                 │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║              [Cancel]  [Submit]       ║
╚═══════════════════════════════════════╝
```

### Step 3: Confirmation
```
╔═══════════════════════════════════════╗
║         Confirm Abort                 ║
╠═══════════════════════════════════════╣
║                                       ║
║  Are you sure you want to abort      ║
║  this delivery?                      ║
║                                       ║
║  Reason: Vehicle breakdown           ║
║                                       ║
║  Note: You will not receive          ║
║  payment for this delivery.          ║
║                                       ║
║          [No, Go Back]  [Yes, Abort] ║
╚═══════════════════════════════════════╝
```

### Step 4: Success Message
```
┌─────────────────────────────────────┐
│  ✓ Delivery aborted. Business has  │
│    been notified and refunded.     │
└─────────────────────────────────────┘
```

## Business Notification

### In Business Dashboard:
```
┌─────────────────────────────────────────┐
│  🔔 New Notification                    │
├─────────────────────────────────────────┤
│  ❌ Delivery Cancelled                  │
│                                         │
│  John Doe cancelled your delivery.     │
│  Reason: Vehicle breakdown             │
│  Your payment has been refunded.       │
│                                         │
│  2 minutes ago                         │
└─────────────────────────────────────────┘
```

## Color Scheme

| Element               | Color         | Purpose                      |
|-----------------------|---------------|------------------------------|
| Abort Button Border   | #FF0000 (Red) | Danger/Warning indication    |
| Abort Button Text     | #FF0000 (Red) | High visibility              |
| Confirmation Button   | #FF0000 (Red) | Final warning                |
| Success Message       | #FF9800 (Orange) | Informational             |
| Dialog Background     | Dark Card     | Consistent with app theme    |

## Button Specifications

### Abort Button (OutlinedButton):
```dart
style: OutlinedButton.styleFrom(
  foregroundColor: Colors.red,
  side: BorderSide(color: Colors.red, width: 2),
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(12),
  ),
)
```

### Dimensions:
- **Width:** Full width (100%)
- **Height:** 48px
- **Border Radius:** 12px
- **Border Width:** 2px
- **Margin:** 12px from above button

### Icon:
- **Type:** Icons.cancel
- **Size:** 24px
- **Color:** Red

## Accessibility

- ✅ Clear warning messages
- ✅ Multiple confirmation steps
- ✅ High contrast red color
- ✅ Large touch targets (48px height)
- ✅ Descriptive labels
- ✅ Icon + text for clarity

## States

### Button States:
1. **Normal:** Red outline, visible
2. **Pressed:** Darker red ripple
3. **Disabled:** N/A (always enabled when visible)

### Screen States:
1. **Idle:** Buttons visible
2. **Processing:** Loading state during API call
3. **Success:** Navigation back + toast
4. **Error:** Error dialog with retry option

## User Experience Flow

```
Rider in Active Delivery
        ↓
Clicks "ABORT DELIVERY"
        ↓
Sees reason options
        ↓
Selects reason (or enters custom)
        ↓
Confirmation dialog appears
        ↓
Clicks "Yes, Abort"
        ↓
API call to DeliveryService.abortDelivery()
        ↓
Cloud Function triggered
        ↓
Money returned to business
        ↓
Notification sent
        ↓
Success toast shown
        ↓
Navigate back to home
```

## Technical Implementation

### Widget Tree:
```
Scaffold
└── StreamBuilder<DeliveryModel>
    └── SingleChildScrollView
        └── Column
            ├── Status Container (Red if cancelled)
            ├── Map Widget
            ├── Fee Display
            ├── Package Details
            └── Action Buttons Column
                ├── Primary Action (Complete/Start)
                └── Abort Button ← NEW
```

### State Management:
- Uses `StreamBuilder` for real-time updates
- Dialog state managed locally
- Navigation handled after async completion
- Location tracking stopped on abort

## Error Handling

### Possible Errors:
1. **Network Error:** "Failed to abort delivery. Check connection."
2. **Permission Error:** "You don't have permission to abort."
3. **Already Completed:** "Cannot abort completed delivery."
4. **Server Error:** "Server error. Please try again."

### Error Display:
```
┌─────────────────────────────────────┐
│  ❌ Error: Failed to abort delivery │
│     Check your connection.          │
└─────────────────────────────────────┘
```

---

**Note:** All visual elements follow the app's existing design system (AppColors, font sizes, spacing).
