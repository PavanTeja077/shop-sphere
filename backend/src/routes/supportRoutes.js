import express from 'express';
import { 
  createTicket, 
  getAllTickets, 
  getUserTickets, 
  replyTicket, 
  updateTicketStatus 
} from '../controllers/apiController.js';

const router = express.Router();

// GET all tickets (for support desk queue)
router.get('/', getAllTickets);

// GET tickets for specific user
router.get('/user/:userId', getUserTickets);

// POST create ticket
router.post('/', createTicket);

// POST reply to a ticket
router.post('/:id/reply', replyTicket);

// PATCH ticket status
router.patch('/:id/status', updateTicketStatus);

export default router;
