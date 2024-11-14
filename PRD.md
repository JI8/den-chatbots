Product Requirements Document (PRD): Conversational Tool Web Application for DEN
Project Overview
This PRD outlines the requirements and functionalities for a public-facing web application for DEN, aimed at providing access to a series of interactive chatbots, each with unique skills and conversational capabilities. The app will allow users to select from different chatbot characters, view and modify their underlying prompts, and engage in guided conversations that adhere to DEN’s principles of transparency, responsibility, and sovereignty.
Objectives
Enable users to explore and interact with multiple chatbot characters.
Allow users to view and modify chatbot prompts to understand the setup and structure of each conversational tool.
Provide clear and safe access to chatbots while upholding DEN’s principles of transparency, user empowerment, and privacy.
Functional Requirements
1. Character Selection and Overview Page
Top Section: Character Selection
Each chatbot character is displayed with:
Image: Represents the character visually.
Name: Character’s name for easy identification.
Description: Brief overview of the chatbot’s primary purpose or personality.
Skills: A list of the specific functions or topics each chatbot is trained to handle.
Buttons:
“Zien hoe ik in elkaar zit”: Opens a prompt editor where users can see and modify the prompt blocks.
“Start chat”: Initiates a conversation with the selected character.
Bottom Section: App Overview and Guidance
A descriptive section explaining the purpose of these tools, DEN’s vision, and guidelines for using the chatbots effectively.
Content should emphasize the organization’s principles of transparency and responsible use.
2. Prompt Editor
Prompt View and Edit Mode:
Display chatbot prompts in a series of structured, fixed blocks that explain the setup of each tool.
Toggle Functionality: Allow users to disable specific blocks to see how this affects the chatbot’s behavior.
Custom Input: Users can add custom text blocks to the prompt to further personalize or test configurations.
Save Changes in Cookies: Any modifications made to the prompt should be saved in cookies to persist for future sessions.
Educational Purpose: This editor provides insight into conversational design and helps users understand the mechanisms behind chatbot configuration.
3. Chat Interface
Guided Chat:
Chatbots function according to their specific prompt instructions, guiding interactions based on configured topics and style.
Misuse/Overuse Prevention:
Limit excessive or abusive usage of chat features to maintain the quality of service.
Options to consider for managing usage:
Limit Chat Interactions: Restrict the number of messages or sessions allowed per user.
Login System (Optional): Provide optional login to save chats and prompt modifications. User data should be limited to the minimum necessary to preserve user privacy.
Navigation:
Return to Character Selection: A button on the left side of the chat interface.
Tool Selection Dropdown: Located at the top center, with icons representing each character’s image beside their names.
Controls on the Right:
“Zien hoe ik in elkaar zit”: Opens the prompt editor for the active chatbot.
“Nieuwe chat”: Starts a new chat session.
4. Tool Expansion Capabilities
Tool Addition: Administrators should have the ability to add new characters/tools via a user interface, without needing to modify the codebase.
Modular Character Addition: Each new tool should include options to set name, description, image, skills, and initial prompt structure.
5. Public Safety and Usage Guidelines
OpenAI GPT-4 API Integration: Utilize OpenAI's GPT-4 API for chatbot conversations.
Transparency: Include an accessible description of the technology used, including OpenAI’s GPT-4 API and the app’s privacy policies.
Responsibility and Safety:
No personal data is collected or retained without explicit consent.
Clear and transparent governance of the software ecosystem to ensure it aligns with DEN’s commitment to independence from commercial and political influence.
Privacy by Design:
Avoid any dark patterns or deceptive design practices that would manipulate or coerce user behavior.
Non-Functional Requirements
Technology Stack
Frontend: React (JavaScript library for building user interfaces).
UI Library: ShadCN (for component styling and layout).
Backend: OpenAI API integration for GPT-4 model access.
Principles of Public Spaces
In alignment with DEN’s public space principles, this application will prioritize:
Transparency: All utilized technologies and their functionalities are openly documented and verifiable.
Responsibility: User interactions are protected and verified, with no personal data stored.
Sovereignty: Users maintain full control over their data and content without commercial exploitation.
Additional Considerations
Privacy and User Data
Cookies: Use for prompt modifications; ensure data security with strict limitations on stored information.
No Personal Data Storage: Profiles, chat histories, or other identifiable data are not stored without explicit consent.
Future-Proofing
Scalability: Ability to support the addition of new chatbot tools easily.
Governance: Transparent and independent oversight on application updates and modifications.
This PRD provides a structured, expandable framework for building DEN's conversational tool web application, meeting both functional needs and adhering to public principles. It emphasizes modularity, transparency, and user-centered design, establishing a safe and engaging environment for users to interact with conversational AI.