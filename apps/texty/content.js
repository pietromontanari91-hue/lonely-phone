// Repository-owned default Texty conversations.
// These initial chats are identical on every Pandrero OS device that loads this app.
// Messages sent during rehearsals/takes are saved only in that device's localStorage;
// there is no cross-device live synchronization without a backend.
window.TEXTY_INITIAL_DATA = {
  currentUserId: "protagonista",
  chats: [
    {
      id: "chat-summer-2026-01",
      title: "Summer 2026",
      avatar: "S",
      initials: "S",
      status: "4 partecipanti",
      participants: [
        { id: "protagonista", name: "Emma" },
        { id: "giulia", name: "Giulia" },
        { id: "martina", name: "Martina" },
        { id: "elisa", name: "Elisa" }
      ],
      messages: [
        { id: "msg-summer-2026-01-001", senderId: "giulia", senderName: "Giulia", text: "Facciamo quindi la settimana del 10?", timestamp: "2026-07-18T09:12:00", type: "text", state: "read" },
        { id: "msg-summer-2026-01-002", senderId: "martina", senderName: "Martina", text: "Io dovrei esserci! 🤞", timestamp: "2026-07-18T09:16:00", type: "text", state: "read" },
        { id: "msg-summer-2026-01-003", senderId: "elisa", senderName: "Elisa", text: "Quella settimana per me è diventata un casino. Possiamo spostare?", timestamp: "2026-07-18T09:24:00", type: "text", state: "delivered" }
      ]
    },
    {
      id: "chat-summer-2026-02",
      title: "Summer 2026",
      avatar: "S",
      initials: "S",
      status: "4 partecipanti",
      participants: [
        { id: "protagonista", name: "Emma" },
        { id: "giulia", name: "Giulia" },
        { id: "martina", name: "Martina" },
        { id: "elisa", name: "Elisa" }
      ],
      messages: [
        { id: "msg-summer-2026-02-001", senderId: "martina", senderName: "Martina", text: "Io proporrei Mykonos, se vi va", timestamp: "2026-07-21T10:03:00", type: "text", state: "read" },
        { id: "msg-summer-2026-02-002", senderId: "giulia", senderName: "Giulia", text: "Ci sono stata anche l'anno scorso, non riusciamo a cambiare?", timestamp: "2026-07-21T10:10:00", type: "text", state: "read" },
        { id: "msg-summer-2026-02-003", senderId: "elisa", senderName: "Elisa", text: "Ragazze, non riesco proprio a venire con voi, scusateeee", timestamp: "2026-07-21T10:21:00", type: "text", state: "delivered" }
      ]
    },
    {
      id: "chat-summer-2026-03",
      title: "Summer 2026",
      avatar: "S",
      initials: "S",
      status: "4 partecipanti",
      participants: [
        { id: "protagonista", name: "Emma" },
        { id: "giulia", name: "Giulia" },
        { id: "martina", name: "Martina" },
        { id: "elisa", name: "Elisa" }
      ],
      messages: [
        { id: "msg-summer-2026-03-001", senderId: "martina", senderName: "Martina", text: "Valencia o Madrid? 💃", timestamp: "2026-07-22T18:52:00", type: "text", state: "read" },
        { id: "msg-summer-2026-03-002", senderId: "giulia", senderName: "Giulia", text: "Se posso scegliere, preferisco Valencia!", timestamp: "2026-07-22T18:56:00", type: "text", state: "read" },
        { id: "msg-summer-2026-03-003", senderId: "elisa", senderName: "Elisa", text: "Ragazze mi devo tirare indietro, emergenza con i miei 😔", timestamp: "2026-07-22T19:00:00", type: "text", state: "delivered" }
      ]
    },
    {
      id: "chat-ufficio",
      title: "Ufficio",
      avatar: "UF",
      initials: "UF",
      status: "3 partecipanti",
      participants: [
        { id: "protagonista", name: "Emma" },
        { id: "laura", name: "Laura" },
        { id: "paolo", name: "Paolo" }
      ],
      messages: [
        { id: "msg-ufficio-001", senderId: "laura", senderName: "Laura", text: "Ho caricato la cartella con i file aggiornati, manca solo il pdf finale.", timestamp: "2026-07-22T09:12:00", type: "text", state: "read" },
        { id: "msg-ufficio-002", senderId: "paolo", senderName: "Paolo", text: "Grazie. Entro le 15 devo mandare tutto al cliente.", timestamp: "2026-07-22T09:18:00", type: "text", state: "read" },
        { id: "msg-ufficio-003", senderId: "protagonista", senderName: "Emma", text: "Lo rileggo in pausa pranzo e vi lascio le note nel documento.", timestamp: "2026-07-22T09:24:00", type: "text", state: "read" },
        { id: "msg-ufficio-004", senderId: "laura", senderName: "Laura", text: "Perfetto, grazie Emma.", timestamp: "2026-07-22T09:25:00", type: "text", state: "delivered" }
      ]
    },
    {
      id: "chat-mamma",
      title: "Mamma",
      avatar: "M",
      initials: "M",
      status: "ultimo accesso 09:44",
      participants: [
        { id: "protagonista", name: "Emma" },
        { id: "mamma", name: "Mamma" }
      ],
      messages: [
        { id: "msg-mamma-001", senderId: "mamma", senderName: "Mamma", text: "Hai mangiato?", timestamp: "2026-07-21T20:12:00", type: "text", state: "read" },
        { id: "msg-mamma-002", senderId: "protagonista", senderName: "Emma", text: "Sì tranquilla", timestamp: "2026-07-21T20:15:00", type: "text", state: "read" },
        { id: "msg-mamma-003", senderId: "mamma", senderName: "Mamma", text: "Fammi sapere quando arrivi", timestamp: "2026-07-21T20:16:00", type: "text", state: "delivered" }
      ]
    }
  ]
};
