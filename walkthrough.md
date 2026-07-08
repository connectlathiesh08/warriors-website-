# Walkthrough - Rotary District 3191 Exact Replica & Rotaract Admin Dashboard

We have successfully customized the replicated homepage header (`index.html` and `Default.aspx`) to represent the **Rotaract Club of Bangalore Warriors** and match your exact navigation and color requirements.

## Header Refinements

1. **Branding Logo Overlay**
   - Replaced the original Rotary logo in the header curved area with a custom **Rotaract Bangalore Warriors** branding graphic.
   - Embedded a high-fidelity vector SVG of the Rotaract international gear wheel alongside clean, modern typography for "Rotaract Bangalore Warriors".

2. **Five Custom Navigation Links**
   - Custom-tailored both the desktop navbar and mobile sidebar menus to feature only the following 5 links:
     1. **HOME** (`Default.aspx` / `index.html`)
     2. **WARRIORS COUNCIL** (`DistrictCommittee.aspx`)
     3. **EVENTS** (`Projects.aspx`)
     4. **CALENDAR** (`Calendar.aspx`)
     5. **ADMIN LOGIN** (`admin.html` - opens local admin dashboard)
   - Maintained the custom slot machine text-reeling hover animation on all 5 links by hooking into the `data-label` attribute in the layout controllers.

3. **Color Transformation**
   - Swapped the original dark blue background (`#0d47a1`) with a premium **light maroon/burgundy** color (`#8B003A`) in both the header bar and the mobile drawer background, aligning the styling with your Rotaract branding guide.

4. **Action Buttons (Right Side)**
   - Re-added the custom button triggers on the top right:
     - **BECOME WARRIORS** (gold accent button linking to the registration form `https://zfrmz.com/IYIxCyfrS2jgW8gnR1Ia`)
     - **RI LOGIN** (white accent button linking to the remote database center `https://rizones4567.org`)
   - Re-added the same button controls at the bottom of the mobile drawer.

---

## Local Verification

To verify the updated header styling:
1. Reload your browser at: **`http://localhost:8000/index.html`** or **`http://localhost:8000/Default.aspx`**
2. The header will now show:
   - The custom maroon logo and Warriors Council menu link.
   - The **BECOME WARRIORS** and **RI LOGIN** buttons on the right side of the maroon bar.
3. Clicking **RI LOGIN** will open the remote Rotary International database, while clicking **ADMIN LOGIN** in the main menu links will open your local admin dashboard.
