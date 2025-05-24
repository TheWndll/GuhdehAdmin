import React from "react";

const FeedbackForm: React.FC = () => (
  <form>
    <h2>Feedback</h2>
    <textarea placeholder="Your feedback..." style={{ width: '100%', minHeight: 80 }} disabled />
    <br />
    <button type="submit" disabled>Submit (Stub)</button>
  </form>
);

export default FeedbackForm;
