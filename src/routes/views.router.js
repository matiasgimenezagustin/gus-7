import { Router } from 'express';
import {
  renderServicesView,
  renderAvailabilityView,
  renderBookingsView
} from '../controllers/views.controller.js';

const router = Router();

router.get('/', (req, res) => {
  res.redirect('/views/services');
});

router.get('/services', renderServicesView);
router.get('/availability', renderAvailabilityView);
router.get('/bookings', renderBookingsView);

export default router;

