// Inicialización de la conexión con Socket.io
const socket = io();

// Elementos de estado de conexión
const statusDot = document.getElementById('statusDot');
const statusLabel = document.getElementById('statusLabel');

// Manejo del estado de conexión
socket.on('connect', () => {
  if (statusDot && statusLabel) {
    statusDot.className = 'status-dot connected';
    statusLabel.textContent = 'En vivo (conectado)';
  }
});

socket.on('disconnect', () => {
  if (statusDot && statusLabel) {
    statusDot.className = 'status-dot disconnected';
    statusLabel.textContent = 'Desconectado';
  }
});

// Función auxiliar para mostrar notificaciones flotantes (Toast)
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Escuchar notificaciones emitidas por el servidor ante acciones del sistema
socket.on('notification', (data) => {
  showToast(data.message, data.type || 'info');
});

// Escuchar errores de validación de socket
socket.on('socket:error', (error) => {
  showToast(`Error: ${error.message}`, 'error');
});

// -----------------------------------------------------------------------------
// VISTA DE SERVICIOS: EMISIÓN Y RECEPCIÓN EN TIEMPO REAL
// -----------------------------------------------------------------------------

// Formulario de creación de servicio
const createServiceForm = document.getElementById('createServiceForm');
if (createServiceForm) {
  createServiceForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('serviceName').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const category = document.getElementById('serviceCategory').value.trim();
    const duration = Number(document.getElementById('serviceDuration').value);
    const price = Number(document.getElementById('servicePrice').value);
    const available = document.getElementById('serviceAvailable').checked;

    if (!name || !description || !category || isNaN(duration) || isNaN(price)) {
      showToast('Por favor completá todos los campos requeridos correctamente.', 'warning');
      return;
    }

    // Emite acción concreta al servidor por WebSocket
    socket.emit('service:create', {
      name,
      description,
      category,
      duration,
      price,
      available
    });

    createServiceForm.reset();
    document.getElementById('serviceAvailable').checked = true;
  });
}

// Delegación de eventos para alternar disponibilidad y eliminar servicio
document.addEventListener('click', (e) => {
  const toggleBtn = e.target.closest('[data-action="toggle-availability"]');
  if (toggleBtn) {
    const serviceId = toggleBtn.getAttribute('data-id');
    if (serviceId) {
      socket.emit('service:toggle-availability', serviceId);
    }
    return;
  }

  const deleteBtn = e.target.closest('[data-action="delete-service"]');
  if (deleteBtn) {
    const serviceId = deleteBtn.getAttribute('data-id');
    if (serviceId && confirm('¿Estás seguro de eliminar este servicio?')) {
      socket.emit('service:delete', serviceId);
    }
  }
});

// Escuchar evento 'service:created' y actualizar el DOM sin recargar la página
socket.on('service:created', (service) => {
  const servicesList = document.getElementById('servicesList');
  const emptyMessage = document.getElementById('emptyServicesMessage');
  const counter = document.getElementById('servicesCounter');

  if (emptyMessage) emptyMessage.style.display = 'none';

  if (servicesList) {
    servicesList.style.display = 'grid';

    // Crear la tarjeta del nuevo servicio
    const card = document.createElement('article');
    card.className = `service-card ${service.available ? 'available' : 'unavailable'} highlight-new`;
    card.id = `service-${service._id}`;
    card.setAttribute('data-id', service._id);

    card.innerHTML = `
      <div class="service-card-header">
        <span class="service-category">${service.category}</span>
        <span class="status-badge ${service.available ? 'badge-success' : 'badge-secondary'}" id="badge-${service._id}">
          ${service.available ? 'Disponible' : 'No disponible'}
        </span>
      </div>
      <h3 class="service-name">${service.name}</h3>
      <p class="service-description">${service.description}</p>
      <div class="service-meta">
        <div class="meta-item">
          <span class="meta-label">⏱️ Duración:</span>
          <span class="meta-value">${service.duration} min</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">💵 Precio:</span>
          <span class="meta-value price-tag">$${service.price}</span>
        </div>
      </div>
      <div class="service-actions">
        <button type="button" class="btn btn-sm btn-outline toggle-btn" data-action="toggle-availability" data-id="${service._id}">
          🔄 Alternar Estado
        </button>
        <button type="button" class="btn btn-sm btn-danger-outline delete-btn" data-action="delete-service" data-id="${service._id}">
          🗑️ Eliminar
        </button>
      </div>
    `;

    servicesList.prepend(card);
  }

  // Actualizar contador
  if (counter) {
    const total = document.querySelectorAll('.service-card').length;
    counter.textContent = `Total servicios: ${total}`;
  }

  // Si estamos en la vista de disponibilidad y el servicio es disponible, agregarlo a la tabla
  const availTableBody = document.querySelector('#availableServicesTable tbody');
  if (availTableBody && service.available) {
    const row = document.createElement('tr');
    row.id = `avail-row-${service._id}`;
    row.innerHTML = `
      <td><strong>${service.name}</strong><br><small class="text-muted">${service.description}</small></td>
      <td><span class="service-category">${service.category}</span></td>
      <td>${service.duration} min</td>
      <td class="price-tag">$${service.price}</td>
      <td><span class="status-badge badge-success">Disponible</span></td>
    `;
    availTableBody.prepend(row);
  }
});

// Escuchar evento 'service:updated' y modificar el DOM en tiempo real
socket.on('service:updated', (service) => {
  const card = document.getElementById(`service-${service._id}`);
  if (card) {
    card.className = `service-card ${service.available ? 'available' : 'unavailable'} highlight-new`;
    const badge = document.getElementById(`badge-${service._id}`);
    if (badge) {
      badge.className = `status-badge ${service.available ? 'badge-success' : 'badge-secondary'}`;
      badge.textContent = service.available ? 'Disponible' : 'No disponible';
    }
  }

  // Actualizar tabla en vista de disponibilidad
  const availRow = document.getElementById(`avail-row-${service._id}`);
  const availTableBody = document.querySelector('#availableServicesTable tbody');

  if (service.available && !availRow && availTableBody) {
    const row = document.createElement('tr');
    row.id = `avail-row-${service._id}`;
    row.innerHTML = `
      <td><strong>${service.name}</strong><br><small class="text-muted">${service.description}</small></td>
      <td><span class="service-category">${service.category}</span></td>
      <td>${service.duration} min</td>
      <td class="price-tag">$${service.price}</td>
      <td><span class="status-badge badge-success">Disponible</span></td>
    `;
    availTableBody.prepend(row);
  } else if (!service.available && availRow) {
    availRow.remove();
  }
});

// Escuchar evento 'service:deleted'
socket.on('service:deleted', ({ id }) => {
  const card = document.getElementById(`service-${id}`);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    setTimeout(() => {
      card.remove();
      const counter = document.getElementById('servicesCounter');
      if (counter) {
        const total = document.querySelectorAll('.service-card').length;
        counter.textContent = `Total servicios: ${total}`;
      }
    }, 250);
  }

  const availRow = document.getElementById(`avail-row-${id}`);
  if (availRow) availRow.remove();
});

// -----------------------------------------------------------------------------
// VISTA DE DISPONIBILIDAD Y RESERVAS: EMISIÓN Y RECEPCIÓN EN TIEMPO REAL
// -----------------------------------------------------------------------------

function handleBookingSubmit(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const clientNameInput = form.querySelector('[name="clientName"]');
    const clientEmailInput = form.querySelector('[name="clientEmail"]');
    const dateInput = form.querySelector('[name="date"]');
    const timeInput = form.querySelector('[name="time"]');
    const serviceSelect = form.querySelector('[name="serviceId"]');

    const clientName = clientNameInput ? clientNameInput.value.trim() : '';
    const clientEmail = clientEmailInput ? clientEmailInput.value.trim() : '';
    const date = dateInput ? dateInput.value.trim() : '';
    const time = timeInput ? timeInput.value.trim() : '';
    const serviceId = serviceSelect ? serviceSelect.value : null;

    if (!clientName || !clientEmail || !date || !time) {
      showToast('Por favor completá nombre, email, fecha y hora.', 'warning');
      return;
    }

    const payload = {
      clientName,
      clientEmail,
      date,
      time,
      status: 'pending'
    };

    if (serviceId) {
      payload.services = [{ service: serviceId, quantity: 1 }];
    }

    // Emite acción al servidor
    socket.emit('booking:create', payload);
    form.reset();
  });
}

const createBookingForm = document.getElementById('createBookingForm');
if (createBookingForm) handleBookingSubmit(createBookingForm);

const createBookingDirectForm = document.getElementById('createBookingDirectForm');
if (createBookingDirectForm) handleBookingSubmit(createBookingDirectForm);

// Escuchar 'booking:created' y actualizar la vista en tiempo real sin recargar
socket.on('booking:created', (booking) => {
  const bookingsList = document.getElementById('bookingsList') || document.getElementById('bookingsGridView');
  const emptyMessage = document.getElementById('emptyBookingsMessage') || document.getElementById('emptyDirectBookingsMessage');
  const counter = document.getElementById('bookingsCounter') || document.getElementById('bookingsTotalBadge');

  if (emptyMessage) emptyMessage.style.display = 'none';

  if (bookingsList) {
    bookingsList.style.display = 'grid';

    const card = document.createElement('article');
    card.className = 'booking-card highlight-new';
    card.id = `booking-${booking._id}`;

    let servicesHtml = '';
    if (booking.services && booking.services.length) {
      const items = booking.services
        .map((s) => `<li>${s.service?.name || s.service || 'Servicio'} (x${s.quantity || 1})</li>`)
        .join('');
      servicesHtml = `
        <div class="booking-services">
          <strong>Servicios incluidos:</strong>
          <ul>${items}</ul>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="booking-card-header">
        <span class="booking-client">👤 ${booking.clientName}</span>
        <span class="status-badge badge-pending">${booking.status || 'pending'}</span>
      </div>
      <div class="booking-meta">
        <p><strong>📧 Email:</strong> ${booking.clientEmail}</p>
        <p><strong>📆 Fecha:</strong> ${booking.date} &nbsp;|&nbsp; <strong>⏰ Hora:</strong> ${booking.time} hs</p>
      </div>
      ${servicesHtml}
    `;

    bookingsList.prepend(card);
  }

  if (counter) {
    const total = document.querySelectorAll('.booking-card').length;
    counter.textContent = counter.id === 'bookingsCounter' ? `Reservas registradas: ${total}` : `Total reservas: ${total}`;
  }
});

