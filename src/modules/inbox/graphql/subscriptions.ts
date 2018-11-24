import messageFields from './messageFields';

const conversationChanged = `
  subscription conversationChanged($_id: String!) {
    conversationChanged(_id: $_id) {
      type
    }
  }
`;

const conversationMessageInserted = `
  subscription conversationMessageInserted($_id: String!) {
    conversationMessageInserted(_id: $_id) {
      _id
      content
      attachments
      conversationId
      internal
      customerId
      userId
      createdAt
      customer
    }
  }
`;

const conversationClientMessageInserted = `
  subscription conversationClientMessageInserted($subdomain: String!) {
    conversationClientMessageInserted(subdomain: $subdomain) {
      _id
    }
  }
`;

const customerConnectionChanged = `
  subscription customerConnectionChanged ($_id: String!) {
    customerConnectionChanged (_id: $_id) {
      _id
      status
    }
  }
`;

export default {
  conversationChanged,
  conversationMessageInserted,
  conversationClientMessageInserted,
  customerConnectionChanged
};
