// Repository-owned default Texty conversations.
// These initial chats are identical on every Pandrero OS device that loads this app.
// Messages sent during rehearsals/takes are saved only in that device's localStorage;
// there is no cross-device live synchronization without a backend.
window.TEXTY_INITIAL_DATA = {
  currentUserId: "protagonista",
  chats: [
    {
      id: "chat-vacanze-ragazze",
      title: "Vacanze ragazze",
      avatar: "VR",
      initials: "VR",
      status: "4 partecipanti",
      participants: [
        { id: "protagonista", name: "Emma" },
        { id: "giulia", name: "Giulia" },
        { id: "marta", name: "Marta" },
        { id: "elisa", name: "Elisa" }
      ],
      messages: [
        { id: "msg-vacanze-001", senderId: "giulia", senderName: "Giulia", text: "Ragazze, allora proviamo a chiudere per agosto?", timestamp: "2026-07-18T18:42:00", type: "text", state: "read" },
        { id: "msg-vacanze-002", senderId: "protagonista", senderName: "Emma", text: "Sì per favore, così blocco treni e ferie. Io avevo segnato dal 10 al 17.", timestamp: "2026-07-18T18:45:00", type: "text", state: "read" },
        { id: "msg-vacanze-003", senderId: "elisa", senderName: "Elisa", text: "Per me quella settimana era perfetta, appena decidiamo fermo la casa.", timestamp: "2026-07-18T18:49:00", type: "text", state: "read" },
        { id: "msg-vacanze-004", senderId: "marta", senderName: "Marta", text: "Quella settimana per me è diventata un casino. Possiamo spostare?", timestamp: "2026-07-18T18:53:00", type: "text", state: "delivered" }
      ]
    },
    {
      id: "chat-sabato-sera",
      title: "Sabato sera",
      avatar: "SS",
      initials: "SS",
      status: "5 partecipanti",
      participants: [
        { id: "protagonista", name: "Emma" },
        { id: "sofia", name: "Sofia" },
        { id: "ale", name: "Ale" },
        { id: "nico", name: "Nico" },
        { id: "chiara", name: "Chiara" }
      ],
      messages: [
        { id: "msg-sabato-001", senderId: "sofia", senderName: "Sofia", text: "Sabato aperitivo in centro o concerto?", timestamp: "2026-07-21T12:16:00", type: "text", state: "read" },
        { id: "msg-sabato-002", senderId: "nico", senderName: "Nico", text: "Concerto! Ho bisogno di ballare, non di stare seduto con le patatine.", timestamp: "2026-07-21T12:18:00", type: "text", state: "read" },
        { id: "msg-sabato-003", senderId: "protagonista", senderName: "Emma", text: "Io arrivo verso le nove, prima ho una cena di famiglia.", timestamp: "2026-07-21T12:23:00", type: "text", state: "read" },
        { id: "msg-sabato-004", senderId: "chiara", senderName: "Chiara", text: "Perfetto, allora ci vediamo lì e ti teniamo un posto vicino a noi.", timestamp: "2026-07-21T12:26:00", type: "text", state: "read" },
        { id: "msg-sabato-005", senderId: "ale", senderName: "Ale", text: "Io compro i biglietti stasera, chi c'è mi mandi un sì secco 😂", timestamp: "2026-07-21T12:31:00", type: "text", state: "delivered" },
        { id: "msg-sabato-006", senderId: "sofia", senderName: "Sofia", text: "Sììì", timestamp: "2026-07-21T12:32:00", type: "text", state: "delivered" }
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
