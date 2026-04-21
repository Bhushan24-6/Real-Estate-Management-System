const API_URL = "http://localhost:5000/api";

// --- GLOBAL HELPERS ---
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top m-3`;
    alertDiv.style.zIndex = "9999";
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// --- PROPERTIES ---
async function loadProperties() {
    try {
        const res = await fetch(`${API_URL}/properties`);
        const data = await res.json();
        const tableBody = document.getElementById("propertyTable");
        
        if (!tableBody) return;

        let output = "";
        data.forEach((p, index) => {
            output += `
                <tr>
                    <td>${index + 1}</td>
                    <td><span class="badge bg-info">${p.property_type}</span></td>
                    <td>${p.address || 'N/A'}</td>
                    <td>${p.area} sqft</td>
                    <td>₹${p.price.toLocaleString()}</td>
                    <td><span class="badge bg-${p.status === 'Available' ? 'success' : 'warning'}">${p.status}</span></td>
                    <td>${p.owner_name || 'N/A'}</td>
                    <td>${p.agent_name || 'N/A'}</td>
                    <td>
                        <button onclick="location.href='scheduleVisit.html?propVisit=${p.property_id}'" class="btn btn-sm btn-outline-info">Schedule Visit</button>
                        <button onclick="location.href='booking.html?prop=${p.property_id}'" class="btn btn-sm btn-outline-success">Book Now</button>
                        <button onclick="openEditModal(${p.property_id})" class="btn btn-sm btn-primary">Edit</button>
                        <button onclick="deleteProperty(${p.property_id})" class="btn btn-sm btn-danger">Delete</button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = output;
    } catch (err) {
        console.error("Error loading properties:", err);
    }
}

async function deleteProperty(id) {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
        const res = await fetch(`${API_URL}/properties/${id}`, { method: 'DELETE' });
        const data = await res.json();
        showAlert(data.message || data);
        loadProperties();
    } catch (err) {
        showAlert("Error deleting property", "danger");
    }
}

async function openEditModal(id) {
    try {
        const res = await fetch(`${API_URL}/properties/${id}`);
        const p = await res.json();

        document.getElementById("editPropId").value = p.property_id;
        document.getElementById("editType").value = p.property_type;
        document.getElementById("editAddress").value = p.address;
        document.getElementById("editArea").value = p.area;
        document.getElementById("editPrice").value = p.price;
        document.getElementById("editStatus").value = p.status;
        document.getElementById("editOwnerSelect").value = p.owner_id;
        document.getElementById("editAgentSelect").value = p.agent_id;

        const modal = new bootstrap.Modal(document.getElementById('editPropertyModal'));
        modal.show();
    } catch (err) {
        showAlert("Error fetching property details", "danger");
    }
}

document.getElementById("editPropertyForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editPropId").value;
    const payload = {
        Property_Type: document.getElementById("editType").value,
        Address: document.getElementById("editAddress").value,
        Area: document.getElementById("editArea").value,
        Price: document.getElementById("editPrice").value,
        Status: document.getElementById("editStatus").value,
        Owner_ID: document.getElementById("editOwnerSelect").value,
        Agent_ID: document.getElementById("editAgentSelect").value
    };

    try {
        const res = await fetch(`${API_URL}/properties/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        showAlert(data.message || "Property updated successfully!");
        bootstrap.Modal.getInstance(document.getElementById('editPropertyModal')).hide();
        loadProperties();
    } catch (err) {
        showAlert("Error updating property", "danger");
    }
});

// --- DROPDOWNS ---
async function loadDropdowns() {
    const ownerSelect = document.getElementById("ownerSelect");
    const agentSelect = document.getElementById("agentSelect");
    const editOwnerSelect = document.getElementById("editOwnerSelect");
    const editAgentSelect = document.getElementById("editAgentSelect");
    const propertySelect = document.getElementById("propertySelect");
    const buyerSelect = document.getElementById("buyerSelect");
    const buyerSelectVisit = document.getElementById("buyerSelectVisit");
    const propertySelectVisit = document.getElementById("propertySelectVisit");

    try {
        if (ownerSelect || editOwnerSelect) {
            const res = await fetch(`${API_URL}/properties/owners`);
            const data = await res.json();
            console.log("Owners data:", data);
            if (Array.isArray(data)) {
                data.forEach(o => {
                    if (ownerSelect) ownerSelect.innerHTML += `<option value="${o.owner_id}">${o.owner_name}</option>`;
                    if (editOwnerSelect) editOwnerSelect.innerHTML += `<option value="${o.owner_id}">${o.owner_name}</option>`;
                });
            } else if (data.error) {
                console.error("Backend error (owners):", data.error);
                showAlert("Error loading owners: " + data.error, "danger");
            }
        }
    } catch (err) {
        console.error("Error loading owners dropdown:", err);
    }

    try {
        if (agentSelect || editAgentSelect) {
            const res = await fetch(`${API_URL}/properties/agents`);
            const data = await res.json();
            console.log("Agents data:", data);
            if (Array.isArray(data)) {
                data.forEach(a => {
                    if (agentSelect) agentSelect.innerHTML += `<option value="${a.agent_id}">${a.agent_name}</option>`;
                    if (editAgentSelect) editAgentSelect.innerHTML += `<option value="${a.agent_id}">${a.agent_name}</option>`;
                });
            } else if (data.error) {
                console.error("Backend error (agents):", data.error);
                showAlert("Error loading agents: " + data.error, "danger");
            }
        }
    } catch (err) {
        console.error("Error loading agents dropdown:", err);
    }

    try {
        if (propertySelect || propertySelectVisit) {
            const res = await fetch(`${API_URL}/properties`);
            const data = await res.json();
            if (Array.isArray(data)) {
                const isAgreementPage = !!document.getElementById("agreementForm");
                data.forEach(p => {
                    const isAvailable = p.status === 'Available';
                    // Show all for agreement page, or only Available for other pages (like booking)
                    if (propertySelect && (isAgreementPage || isAvailable)) {
                        propertySelect.innerHTML += `<option value="${p.property_id}">${p.property_type} - ₹${p.price.toLocaleString()} (${p.status})</option>`;
                    }
                    if (propertySelectVisit && isAvailable) {
                        propertySelectVisit.innerHTML += `<option value="${p.property_id}">${p.property_type} (${p.address || 'No Address'})</option>`;
                    }
                });
            }
        }
    } catch (err) {
        console.error("Error loading properties dropdown:", err);
    }

    try {
        if (buyerSelect || buyerSelectVisit) {
            const res = await fetch(`${API_URL}/buyers`);
            const data = await res.json();
            if (Array.isArray(data)) {
                data.forEach(b => {
                    if (buyerSelect) buyerSelect.innerHTML += `<option value="${b.buyer_id}">${b.buyer_name}</option>`;
                    if (buyerSelectVisit) buyerSelectVisit.innerHTML += `<option value="${b.buyer_id}">${b.buyer_name}</option>`;
                });
            }
        }
    } catch (err) {
        console.error("Error loading buyers dropdown:", err);
    }

    try {
        const bookingSelect = document.getElementById("bookingSelect");
        if (bookingSelect) {
            const res = await fetch(`${API_URL}/bookings`);
            const data = await res.json();
            if (Array.isArray(data)) {
                data.forEach(bk => {
                    bookingSelect.innerHTML += `<option value="${bk.booking_id}">Booking #${bk.booking_id} - ${bk.buyer_name} (${bk.property_type})</option>`;
                });
            }
        }
    } catch (err) {
        console.error("Error loading bookings dropdown:", err);
    }
}

// --- FORM SUBMISSIONS ---
document.getElementById("propertyForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        Property_Type: document.getElementById("type").value,
        Address: document.getElementById("address").value,
        Area: document.getElementById("area").value,
        Price: document.getElementById("price").value,
        Status: document.getElementById("status").value,
        Owner_ID: document.getElementById("ownerSelect").value,
        Agent_ID: document.getElementById("agentSelect").value
    };

    try {
        const res = await fetch(`${API_URL}/properties`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        alert(result.message || "Property added successfully!");
        window.location.href = "properties.html";
    } catch (err) {
        showAlert("Error adding property", "danger");
    }
});

document.getElementById("buyerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        Buyer_Name: document.getElementById("buyerName").value,
        Contact_No: document.getElementById("buyerContact").value,
        DOB: document.getElementById("buyerDOB").value,
        Budget: document.getElementById("buyerBudget").value
    };

    try {
        const res = await fetch(`${API_URL}/buyers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        alert(result.message || "Buyer registered successfully!");
        window.location.href = "buyers.html";
    } catch (err) {
        showAlert("Error registering buyer", "danger");
    }
});

document.getElementById("bookingForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const propertyId = document.getElementById("propertySelect").value;
    const buyerId = document.getElementById("buyerSelect").value;
    const date = document.getElementById("bookingDate").value;
    const status = document.getElementById("bookingStatus").value;

    const payload = {
        Buyer_ID: buyerId,
        Property_ID: propertyId,
        Booking_Date: date,
        Booking_Status: status
    };

    try {
        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showAlert("Booking confirmed!");
        e.target.reset();
    } catch (err) {
        showAlert("Error creating booking", "danger");
    }
});

document.getElementById("visitForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        Buyer_ID: document.getElementById("buyerSelectVisit").value,
        Property_ID: document.getElementById("propertySelectVisit").value,
        Visit_Date: document.getElementById("visitDate").value,
        Feedback: document.getElementById("feedback").value
    };

    try {
        const res = await fetch(`${API_URL}/visits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showAlert("Visit recorded successfully!");
        e.target.reset();
    } catch (err) {
        showAlert("Error recording visit", "danger");
    }
});

// --- OWNERS ---
async function loadOwners() {
    try {
        const res = await fetch(`${API_URL}/owners`);
        const data = await res.json();
        const tableBody = document.getElementById("ownerTable");
        
        if (!tableBody) return;

        let output = "";
        data.forEach((o, index) => {
            output += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${o.owner_name}</td>
                    <td>${o.email}</td>
                    <td>${o.contact_no}</td>
                    <td>${o.city || 'N/A'}</td>
                    <td>
                        <button onclick="viewOwnerProperties(${o.owner_id})" class="btn btn-sm btn-info">Properties</button>
                        <button onclick="openOwnerEditModal(${o.owner_id})" class="btn btn-sm btn-primary">Edit</button>
                        <button onclick="deleteOwner(${o.owner_id})" class="btn btn-sm btn-danger">Delete</button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = output;
    } catch (err) {
        console.error("Error loading owners:", err);
    }
}

document.getElementById("ownerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        Owner_Name: document.getElementById("ownerName").value,
        Email: document.getElementById("ownerEmail").value,
        Contact_No: document.getElementById("ownerContact").value,
        Street: document.getElementById("ownerStreet").value,
        City: document.getElementById("ownerCity").value,
        Pincode: document.getElementById("ownerPincode").value
    };

    try {
        const res = await fetch(`${API_URL}/owners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showAlert("Owner added successfully!");
        e.target.reset();
    } catch (err) {
        showAlert("Error adding owner", "danger");
    }
});

async function openOwnerEditModal(id) {
    try {
        const res = await fetch(`${API_URL}/owners/${id}`);
        const o = await res.json();

        document.getElementById("editOwnerId").value = o.owner_id;
        document.getElementById("editOwnerName").value = o.owner_name;
        document.getElementById("editOwnerEmail").value = o.email;
        document.getElementById("editOwnerContact").value = o.contact_no;
        document.getElementById("editOwnerStreet").value = o.street;
        document.getElementById("editOwnerCity").value = o.city;
        document.getElementById("editOwnerPincode").value = o.pincode;

        const modal = new bootstrap.Modal(document.getElementById('editOwnerModal'));
        modal.show();
    } catch (err) {
        showAlert("Error fetching owner details", "danger");
    }
}

document.getElementById("editOwnerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editOwnerId").value;
    const payload = {
        Owner_Name: document.getElementById("editOwnerName").value,
        Email: document.getElementById("editOwnerEmail").value,
        Contact_No: document.getElementById("editOwnerContact").value,
        Street: document.getElementById("editOwnerStreet").value,
        City: document.getElementById("editOwnerCity").value,
        Pincode: document.getElementById("editOwnerPincode").value
    };

    try {
        const res = await fetch(`${API_URL}/owners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showAlert("Owner updated successfully!");
        bootstrap.Modal.getInstance(document.getElementById('editOwnerModal')).hide();
        loadOwners();
    } catch (err) {
        showAlert("Error updating owner", "danger");
    }
});

async function deleteOwner(id) {
    if (!confirm("Are you sure you want to delete this owner?")) return;
    try {
        const res = await fetch(`${API_URL}/owners/${id}`, { method: 'DELETE' });
        loadOwners();
        showAlert("Owner deleted successfully!");
    } catch (err) {
        showAlert("Error deleting owner", "danger");
    }
}

async function viewOwnerProperties(id) {
    try {
        const res = await fetch(`${API_URL}/owners/${id}/properties`);
        const data = await res.json();
        const tableBody = document.getElementById("ownerPropertiesTable");
        
        let output = "";
        data.forEach((p, index) => {
            output += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${p.property_type}</td>
                    <td>${p.address || 'N/A'}</td>
                    <td>₹${p.price.toLocaleString()}</td>
                    <td>${p.status}</td>
                </tr>
            `;
        });
        tableBody.innerHTML = output || "<tr><td colspan='5' class='text-center'>No properties found for this owner</td></tr>";

        const modal = new bootstrap.Modal(document.getElementById('ownerPropertiesModal'));
        modal.show();
    } catch (err) {
        showAlert("Error loading owner properties", "danger");
    }
}

// --- VISITS ---
async function loadVisits() {
    try {
        const res = await fetch(`${API_URL}/visits`);
        const data = await res.json();
        const tableBody = document.getElementById("visitTable");
        
        if (!tableBody) return;

        let output = "";
        data.forEach((v, index) => {
            const date = new Date(v.visit_date).toLocaleDateString();
            output += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${date}</td>
                    <td>${v.buyer_name}</td>
                    <td>${v.contact_no}</td>
                    <td><span class="badge bg-info">${v.property_type}</span></td>
                    <td>${v.address || 'N/A'}</td>
                    <td>${v.feedback || '<em>No feedback</em>'}</td>
                </tr>
            `;
        });
        tableBody.innerHTML = output;
    } catch (err) {
        console.error("Error loading visits:", err);
    }
}

// --- DASHBOARD ---
async function loadDashboardStats() {
    try {
        const res = await fetch(`${API_URL}/dashboard/stats`);
        const stats = await res.json();
        
        if (document.getElementById("totalProperties")) document.getElementById("totalProperties").innerText = stats.total_properties;
        if (document.getElementById("totalBuyers")) document.getElementById("totalBuyers").innerText = stats.total_buyers;
        if (document.getElementById("totalAgents")) document.getElementById("totalAgents").innerText = stats.total_agents;
        if (document.getElementById("totalBookings")) document.getElementById("totalBookings").innerText = stats.total_bookings;
    } catch (err) {
        console.error("Error loading stats:", err);
    }
}

async function loadLatestListings() {
    try {
        const res = await fetch(`${API_URL}/dashboard/latest`);
        const data = await res.json();
        const tableBody = document.getElementById("latestListingsTable");
        
        if (!tableBody) return;

        let output = "";
        data.forEach((l, index) => {
            const date = new Date(l.listing_date).toLocaleDateString();
            output += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${date}</td>
                    <td><span class="badge bg-info">${l.listing_type}</span></td>
                    <td>${l.property_type}</td>
                    <td>${l.address || 'N/A'}</td>
                    <td>₹${l.price.toLocaleString()}</td>
                </tr>
            `;
        });
        tableBody.innerHTML = output || "<tr><td colspan='5' class='text-center'>No recent listings found</td></tr>";
    } catch (err) {
        console.error("Error loading latest listings:", err);
    }
}

// --- AGENTS ---
async function loadAgents() {
    try {
        const res = await fetch(`${API_URL}/agents`);
        const data = await res.json();
        const tableBody = document.getElementById("agentTable");
        
        if (!tableBody) return;

        let output = "";
        data.forEach((a, index) => {
            output += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${a.agent_name}</td>
                    <td>${a.contact_no}</td>
                    <td>${a.commission_rate}%</td>
                    <td>
                        <button onclick="viewAgentProperties(${a.agent_id})" class="btn btn-sm btn-info">Properties</button>
                        <button onclick="openAssignModal(${a.agent_id})" class="btn btn-sm btn-success">Assign</button>
                        <button onclick="openAgentEditModal(${a.agent_id})" class="btn btn-sm btn-primary">Edit</button>
                        <button onclick="deleteAgent(${a.agent_id})" class="btn btn-sm btn-danger">Delete</button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = output;
    } catch (err) {
        console.error("Error loading agents:", err);
    }
}

document.getElementById("agentForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        Agent_Name: document.getElementById("agentName").value,
        Contact_No: document.getElementById("agentContact").value,
        Commission_Rate: document.getElementById("agentCommission").value
    };

    try {
        const res = await fetch(`${API_URL}/agents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        alert(result.message || "Agent added successfully!");
        window.location.href = "agents.html";
    } catch (err) {
        showAlert("Error adding agent", "danger");
    }
});

async function openAgentEditModal(id) {
    try {
        const res = await fetch(`${API_URL}/agents/${id}`);
        const a = await res.json();

        document.getElementById("editAgentId").value = a.agent_id;
        document.getElementById("editAgentName").value = a.agent_name;
        document.getElementById("editAgentContact").value = a.contact_no;
        document.getElementById("editAgentCommission").value = a.commission_rate;

        const modal = new bootstrap.Modal(document.getElementById('editAgentModal'));
        modal.show();
    } catch (err) {
        showAlert("Error fetching agent details", "danger");
    }
}

document.getElementById("editAgentForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editAgentId").value;
    const payload = {
        Agent_Name: document.getElementById("editAgentName").value,
        Contact_No: document.getElementById("editAgentContact").value,
        Commission_Rate: document.getElementById("editAgentCommission").value
    };

    try {
        await fetch(`${API_URL}/agents/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showAlert("Agent updated successfully!");
        bootstrap.Modal.getInstance(document.getElementById('editAgentModal')).hide();
        loadAgents();
    } catch (err) {
        showAlert("Error updating agent", "danger");
    }
});

async function deleteAgent(id) {
    if (!confirm("Are you sure you want to delete this agent?")) return;
    try {
        await fetch(`${API_URL}/agents/${id}`, { method: 'DELETE' });
        loadAgents();
        showAlert("Agent deleted successfully!");
    } catch (err) {
        showAlert("Error deleting agent", "danger");
    }
}

async function viewAgentProperties(id) {
    try {
        const res = await fetch(`${API_URL}/agents/${id}/properties`);
        const data = await res.json();
        const tableBody = document.getElementById("agentPropertiesTable");
        
        let output = "";
        data.forEach((p, index) => {
            output += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${p.property_type}</td>
                    <td>${p.address || 'N/A'}</td>
                    <td>₹${p.price.toLocaleString()}</td>
                    <td>${p.status}</td>
                </tr>
            `;
        });
        tableBody.innerHTML = output || "<tr><td colspan='5' class='text-center'>No properties found for this agent</td></tr>";

        const modal = new bootstrap.Modal(document.getElementById('agentPropertiesModal'));
        modal.show();
    } catch (err) {
        showAlert("Error loading agent properties", "danger");
    }
}

async function openAssignModal(agentId) {
    document.getElementById("assignAgentId").value = agentId;
    const select = document.getElementById("unassignedPropertySelect");
    select.innerHTML = "<option value=''>Loading properties...</option>";
    
    try {
        const res = await fetch(`${API_URL}/properties`);
        const data = await res.json();
        // Option: only show unassigned (null agent_id) or all? Let's show all and let user re-assign.
        let output = '<option value="">Select Property</option>';
        data.forEach(p => {
            output += `<option value="${p.property_id}">${p.property_type} - ${p.address} (Price: ₹${p.price.toLocaleString()})</option>`;
        });
        select.innerHTML = output;

        const modal = new bootstrap.Modal(document.getElementById('assignPropertyModal'));
        modal.show();
    } catch (err) {
        showAlert("Error loading properties", "danger");
    }
}

document.getElementById("assignPropertyForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        Agent_ID: document.getElementById("assignAgentId").value,
        Property_ID: document.getElementById("unassignedPropertySelect").value
    };

    try {
        await fetch(`${API_URL}/agents/assign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showAlert("Property assigned successfully!");
        bootstrap.Modal.getInstance(document.getElementById('assignPropertyModal')).hide();
    } catch (err) {
        showAlert("Error assigning property", "danger");
    }
});

// --- BUYERS ---
async function loadBuyers() {
    try {
        const res = await fetch(`${API_URL}/buyers`);
        const data = await res.json();
        const tableBody = document.getElementById("buyerTable");
        
        if (!tableBody) return;

        let output = "";
        data.forEach((b, index) => {
            output += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${b.buyer_name}</td>
                    <td>${b.contact_no}</td>
                    <td>₹${b.budget.toLocaleString()}</td>
                    <td>
                        <button onclick="viewBuyerHistory(${b.buyer_id}, '${b.buyer_name}')" class="btn btn-sm btn-info">View History</button>
                        <button onclick="deleteBuyer(${b.buyer_id})" class="btn btn-sm btn-danger">Delete</button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = output;
    } catch (err) {
        console.error("Error loading buyers:", err);
    }
}

async function viewBuyerHistory(id, name) {
    document.getElementById("buyerDetailsTitle").innerText = `History for ${name}`;
    try {
        // Load Visits
        const visitRes = await fetch(`${API_URL}/buyers/${id}/visits`);
        const visits = await visitRes.json();
        let visitOut = "";
        visits.forEach(v => {
            visitOut += `<tr><td>${new Date(v.visit_date).toLocaleDateString()}</td><td>${v.property_type}<br><small>${v.address}</small></td><td>${v.feedback}</td></tr>`;
        });
        document.getElementById("buyerVisitsTableBody").innerHTML = visitOut || '<tr><td colspan="3" class="text-center">No visits recorded</td></tr>';

        // Load Bookings
        const bookingRes = await fetch(`${API_URL}/buyers/${id}/bookings`);
        const bookings = await bookingRes.json();
        let bookOut = "";
        bookings.forEach(bk => {
            bookOut += `<tr><td>${new Date(bk.booking_date).toLocaleDateString()}</td><td>${bk.property_type}<br><small>${bk.address}</small></td><td>₹${bk.price.toLocaleString()}</td><td>${bk.booking_status}</td></tr>`;
        });
        document.getElementById("buyerBookingsTableBody").innerHTML = bookOut || '<tr><td colspan="4" class="text-center">No bookings found</td></tr>';

        const modal = new bootstrap.Modal(document.getElementById('buyerDetailsModal'));
        modal.show();
    } catch (err) {
        showAlert("Error loading buyer history", "danger");
    }
}

async function deleteBuyer(id) {
    if (!confirm("Are you sure you want to delete this buyer?")) return;
    try {
        await fetch(`${API_URL}/buyers/${id}`, { method: 'DELETE' });
        loadBuyers();
        showAlert("Buyer deleted successfully!");
    } catch (err) {
        showAlert("Error deleting buyer", "danger");
    }
}

// --- LISTINGS ---
async function loadListings(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const res = await fetch(`${API_URL}/properties?${queryParams}`);
        const data = await res.json();
        const grid = document.getElementById("listingsGrid");
        
        if (!grid) return;

        let output = "";
        data.forEach(p => {
            const statusClass = p.status === 'Available' ? 'bg-success' : (p.status === 'Sold' ? 'bg-danger' : 'bg-warning');
            output += `
                <div class="col-md-4 mb-4">
                    <div class="property-card">
                        <div class="property-img-placeholder">
                            ${p.property_type[0]}
                            <span class="badge-status ${statusClass}">${p.status}</span>
                        </div>
                        <div class="card-body p-4">
                            <h5 class="fw-bold mb-1">${p.property_type}</h5>
                            <p class="text-muted small mb-3"><i class="bi bi-geo-alt"></i> ${p.address}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="price-tag">₹${p.price.toLocaleString()}</span>
                                <span class="text-secondary small">${p.area} sqft</span>
                            </div>
                            <hr class="my-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <small class="text-muted">Owner: ${p.owner_name || 'N/A'}</small>
                                <button onclick="location.href='scheduleVisit.html?propVisit=${p.property_id}'" class="btn btn-sm btn-outline-info">Schedule Visit</button>
                            </div>
                            <button onclick="location.href='booking.html?prop=${p.property_id}'" class="btn btn-sm btn-primary w-100">Book Now</button>
                        </div>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = output || '<div class="col-12 text-center my-5"><h3>No properties match your search criteria.</h3></div>';
    } catch (err) {
        console.error("Error loading listings:", err);
    }
}

document.getElementById("filterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const filters = {
        type: document.getElementById("filterType").value,
        minPrice: document.getElementById("minPrice").value,
        maxPrice: document.getElementById("maxPrice").value,
        minArea: document.getElementById("minArea").value,
        maxArea: document.getElementById("maxArea").value
    };
    loadListings(filters);
});

function resetFilters() {
    document.getElementById("filterForm").reset();
    loadListings();
}

// --- BOOKINGS ---
async function loadBookings() {
    try {
        const res = await fetch(`${API_URL}/bookings`);
        const data = await res.json();
        const tableBody = document.getElementById("bookingsListTable");
        
        if (!tableBody) return;

        let output = "";
        data.forEach((b, index) => {
            const statusBadge = b.booking_status === 'Confirmed' ? 'bg-success' : (b.booking_status === 'Cancelled' ? 'bg-danger' : 'bg-warning');
            output += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${new Date(b.booking_date).toLocaleDateString()}</td>
                    <td>${b.buyer_name}</td>
                    <td>${b.property_type}</td>
                    <td>₹${b.price.toLocaleString()}</td>
                    <td><span class="badge ${statusBadge}">${b.booking_status}</span></td>
                    <td>
                        <button onclick="cancelBooking(${b.booking_id})" class="btn btn-sm btn-outline-danger">Cancel</button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = output || '<tr><td colspan="6" class="text-center">No bookings found.</td></tr>';
    } catch (err) {
        console.error("Error loading bookings:", err);
    }
}

async function cancelBooking(id) {
    if (!confirm("Are you sure you want to cancel this booking? This will set the property back to Available.")) return;
    try {
        const res = await fetch(`${API_URL}/bookings/${id}`, { method: "DELETE" });
        const result = await res.json();
        alert(result.message);
        loadBookings();
    } catch (err) {
        console.error("Error cancelling booking:", err);
    }
}

// --- PAYMENTS ---
async function loadPayments() {
    try {
        const res = await fetch(`${API_URL}/payments`);
        const data = await res.json();
        const tableBody = document.getElementById("paymentTable");
        
        if (!tableBody) return;

        let output = "";
        data.forEach((p, index) => {
            output += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${p.buyer_name}</td>
                    <td>${p.property_type}</td>
                    <td>₹${p.amount.toLocaleString()}</td>
                    <td>${new Date(p.payment_date).toLocaleDateString()}</td>
                    <td>${p.payment_mode}</td>
                    <td>
                        <button onclick="deletePayment(${p.payment_no})" class="btn btn-sm btn-outline-danger">Delete</button>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = output || '<tr><td colspan="7" class="text-center">No payments found.</td></tr>';
    } catch (err) {
        console.error("Error loading payments:", err);
    }
}

document.getElementById("paymentForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        Booking_ID: document.getElementById("bookingSelect").value,
        Amount: document.getElementById("paymentAmount").value,
        Payment_Date: document.getElementById("paymentDate").value,
        Payment_Mode: document.getElementById("paymentMode").value
    };

    try {
        const res = await fetch(`${API_URL}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        alert(result.message);
        window.location.href = "payments.html";
    } catch (err) {
        console.error("Error recording payment:", err);
    }
});

async function deletePayment(id) {
    if (!confirm("Are you sure you want to delete this payment record?")) return;
    try {
        const res = await fetch(`${API_URL}/payments/${id}`, { method: "DELETE" });
        const result = await res.json();
        alert(result.message);
        loadPayments();
    } catch (err) {
        console.error("Error deleting payment:", err);
    }
}

// --- AGREEMENTS & DOCUMENTS ---
async function loadAgreements() {
    try {
        const res = await fetch(`${API_URL}/agreements`);
        const data = await res.json();
        const container = document.getElementById("agreementsContainer");
        if (!container) return;

        let output = "";
        data.forEach(a => {
            output += `
                <div class="col-md-6 mb-4">
                    <div class="card shadow-sm border-0 h-100">
                        <div class="card-body">
                            <h5 class="card-title text-primary">${a.agreement_type}</h5>
                            <p class="card-text mb-1"><strong>Property:</strong> ${a.property_type}</p>
                            <p class="text-muted small mb-3">${a.address}</p>
                            <p class="mb-1 small"><strong>Valid:</strong> ${new Date(a.start_date).toLocaleDateString()} to ${new Date(a.end_date).toLocaleDateString()}</p>
                            <div class="d-flex gap-2 mt-3">
                                <button onclick="viewDocuments(${a.agreement_id})" class="btn btn-sm btn-info text-white">View Docs</button>
                                <button onclick="deleteAgreement(${a.agreement_id})" class="btn btn-sm btn-outline-danger">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = output || '<div class="col-12 text-center text-muted">No agreements found.</div>';
    } catch (err) {
        console.error("Error loading agreements:", err);
    }
}

document.getElementById("agreementForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        Property_ID: document.getElementById("propertySelect").value,
        Agreement_Type: document.getElementById("agreementType").value,
        Start_Date: document.getElementById("startDate").value,
        End_Date: document.getElementById("endDate").value
    };

    try {
        const res = await fetch(`${API_URL}/agreements`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        alert(result.message);
        window.location.href = "agreements.html";
    } catch (err) {
        console.error("Error creating agreement:", err);
    }
});

async function viewDocuments(agreementId) {
    const modal = new bootstrap.Modal(document.getElementById('documentsModal'));
    document.getElementById('addDocBtn').onclick = () => {
        window.location.href = `addDocument.html?agreementId=${agreementId}`;
    };
    
    await loadDocumentsTable(agreementId);
    modal.show();
}

async function loadDocumentsTable(agreementId) {
    try {
        const res = await fetch(`${API_URL}/documents/agreement/${agreementId}`);
        const data = await res.json();
        const tbody = document.getElementById('docsTableBody');
        let output = "";
        data.forEach(d => {
            output += `
                <tr>
                    <td>${d.document_type}</td>
                    <td>${new Date(d.upload_date).toLocaleDateString()}</td>
                    <td>
                        <button onclick="deleteDocument(${d.document_no}, ${agreementId})" class="btn btn-sm btn-danger">Delete</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = output || '<tr><td colspan="3" class="text-center">No documents uploaded.</td></tr>';
    } catch (err) {
        console.error("Error loading documents:", err);
    }
}

document.getElementById("documentForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        Agreement_ID: document.getElementById("agreementIdInput").value,
        Document_Type: document.getElementById("docType").value,
        Upload_Date: document.getElementById("uploadDate").value
    };

    try {
        const res = await fetch(`${API_URL}/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        alert(result.message);
        window.location.href = "agreements.html";
    } catch (err) {
        console.error("Error adding document:", err);
    }
});

async function deleteAgreement(id) {
    if (!confirm("Are you sure? This will delete the agreement record.")) return;
    try {
        const res = await fetch(`${API_URL}/agreements/${id}`, { method: "DELETE" });
        const result = await res.json();
        alert(result.message);
        loadAgreements();
    } catch (err) {
        console.error("Error deleting agreement:", err);
    }
}

async function deleteDocument(id, agreementId) {
    if (!confirm("Delete this document record?")) return;
    try {
        const res = await fetch(`${API_URL}/documents/${id}`, { method: "DELETE" });
        const result = await res.json();
        alert(result.message);
        loadDocumentsTable(agreementId);
    } catch (err) {
        console.error("Error deleting document:", err);
    }
}

// --- REPORTS ---
async function loadReports() {
    // 1. Agent Properties
    try {
        const res = await fetch(`${API_URL}/reports/agent-properties`);
        const data = await res.json();
        const tbody = document.getElementById("agentReportBody");
        if (tbody) {
            tbody.innerHTML = data.map(r => `<tr><td>${r.agent_name}</td><td><span class="badge bg-secondary">${r.property_count}</span></td></tr>`).join('');
        }
    } catch (e) { console.error(e); }

    // 2. High Budget Buyers
    try {
        const res = await fetch(`${API_URL}/reports/high-budget-buyers`);
        const data = await res.json();
        const tbody = document.getElementById("buyerReportBody");
        if (tbody) {
            tbody.innerHTML = data.map(b => `<tr><td>${b.buyer_name}</td><td>${b.contact_no}</td><td>₹${parseFloat(b.budget).toLocaleString()}</td></tr>`).join('');
        }
    } catch (e) { console.error(e); }

    // 3. Total Payments
    try {
        const res = await fetch(`${API_URL}/reports/total-payments`);
        const data = await res.json();
        const tbody = document.getElementById("paymentReportBody");
        if (tbody) {
            tbody.innerHTML = data.map(p => `<tr><td>#${p.booking_id}</td><td>${p.buyer_name}</td><td>₹${parseFloat(p.total_amount).toLocaleString()}</td></tr>`).join('');
        }
    } catch (e) { console.error(e); }
}

// Initialize
window.onload = () => {
    if (document.getElementById("totalProperties")) loadDashboardStats();
    if (document.getElementById("latestListingsTable")) loadLatestListings();
    if (document.getElementById("propertyTable")) loadProperties();
    if (document.getElementById("visitTable")) loadVisits();
    if (document.getElementById("ownerTable")) loadOwners();
    if (document.getElementById("agentTable")) loadAgents();
    if (document.getElementById("buyerTable")) loadBuyers();
    if (document.getElementById("listingsGrid")) loadListings();
    if (document.getElementById("bookingsListTable")) loadBookings();
    if (document.getElementById("paymentTable")) loadPayments();
    if (document.getElementById("agreementsContainer")) loadAgreements();
    if (document.getElementById("agentReportBody")) loadReports();
    loadDropdowns();
};

