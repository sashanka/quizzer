import express from 'express';
import multer from 'multer';
import { generateQuiz } from './services/gemini';
import { createGoogleForm } from './services/googleForms';
import { DEFAULT_SYSTEM_PROMPT } from './config/defaultPrompt';
import pdfParse from 'pdf-parse';
import fs from 'fs';

import { google } from 'googleapis';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// OAuth2 Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Surface actionable server-side failures (expired Google auth, quota, etc.) to the
// client instead of a generic message that sends the user digging through logs.
const toClientError = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

router.get('/config', (req, res) => {
  res.json({ defaultPrompt: DEFAULT_SYSTEM_PROMPT });
});

router.get('/flashcards', (req, res) => {
  res.json({
    title: "The American Revolution",
    subtitle: "Chapters 1–7",
    sections: [
      { title: "Ch. 1: Meet the Colonists", questions: [
        { question: "What was the approximate population of the colonies by 1750?", answer: "The population had already passed one million and was quickly climbing toward two million." },
        { question: "What mountain range marked the western spread of settlements by 1750?", answer: "Appalachian Mountains" },
        { question: "Besides England, from what other European country did many colonists come from?", answer: "Germany" },
        { question: "Approximately how many colonial families lived on farms?", answer: "More than nine out of ten" },
        { question: "What city was becoming the second-largest in the British Empire next to London?", answer: "Philadelphia" },
        { question: "List two goods merchants sent from East Coast cities to other parts of the world.", answer: "Lumber, fur, salted fish, flour, rice, indigo, and tobacco" },
        { question: "What kind of cabin, originally built by Swedes, became popular on the frontier?", answer: "Log cabin" },
        { question: "Name two words borrowed from German that became part of American English.", answer: "Noodle and pretzel" },
        { question: "Name two words borrowed from Native American languages.", answer: "Pecan, moccasin, skunk, and squash" },
        { question: "How often did mail delivery between Philadelphia and Boston run by the mid-1750s?", answer: "Once a week" },
      ]},
      { title: "Ch. 2: Life in the Colonies", questions: [
        { question: "Why would a colonial child likely not have their own bedroom or bed?", answer: "Families were large, houses were crowded, and children shared beds or straw mattresses." },
        { question: "What was a boy's first job in the morning on a colonial farm?", answer: "To bring in firewood and build the fire" },
        { question: "What chores would a colonial girl typically do after breakfast?", answer: "Make candles, preserve foods, feed animals, cook the noon meal, sew, knit, weave, or spin yarn" },
        { question: "Why did most colonial children not go to school for many years?", answer: "Once they could read and write, most parents felt they didn't need any more school." },
        { question: "At what age did enslaved children typically begin working in the fields?", answer: "About ten years old" },
        { question: "What did many colonists use to make their own medicines?", answer: "Plants called herbs, and also roots and bark of trees" },
        { question: "Describe one 'special trick' for bringing down a fever.", answer: "Cut toenails, put clippings in a linen bag, tie it around an eel's neck — when the eel dies, the fever supposedly goes down." },
        { question: "What was a common cure colonial doctors used for almost any illness?", answer: "Bleeding the patient" },
        { question: "What food should colonial children avoid between meals?", answer: "No eating between meals, except for dry bread." },
        { question: "What percentage of colonial families lived on farms?", answer: "Nine out of ten" },
      ]},
      { title: "Ch. 3: Rights of Englishmen", questions: [
        { question: "What was the greatest empire most colonists felt proud to be part of?", answer: "The British Empire" },
        { question: "In what year did England, Wales, and Scotland unite as Great Britain?", answer: "1707" },
        { question: "What law-making body did colonists model their governing bodies after?", answer: "The English Parliament" },
        { question: "What did Parliament insist only they — not the king — should decide?", answer: "Decisions about taxes and spending" },
        { question: "What were the law-making bodies in the colonies usually called?", answer: "Assemblies" },
        { question: "Who was generally allowed to vote in the colonies?", answer: "White men who owned enough property" },
        { question: "What three groups were typically NOT allowed to vote?", answer: "Women, African Americans, and Native Americans" },
        { question: "What right protected citizens from unwarranted searches of their homes?", answer: "Government officers could not search your home or business whenever they felt like it." },
        { question: "What right did British citizens have if accused of breaking a law?", answer: "The right to a trial before a jury of fellow citizens." },
        { question: "What did Benjamin Franklin say about colonists' desire for independence around 1763?", answer: "He said he never heard in any conversation the least desire for separation from England." },
      ]},
      { title: "Ch. 4: Hard Lessons", questions: [
        { question: "How old was the Virginia officer who delivered a message to the French in 1753?", answer: "Twenty-one years old" },
        { question: "What volunteer army did the young officer (Washington) belong to?", answer: "The Virginia militia" },
        { question: "What was the Virginia governor's message to the French general in 1753?", answer: "Your forts are on Virginia's land. Get out!" },
        { question: "What nearly happened to George Washington crossing an ice-filled river?", answer: "He was knocked overboard and nearly drowned." },
        { question: "What fort did the French capture and rename Fort Duquesne?", answer: "A small British fort in western Pennsylvania on the site of present-day Pittsburgh" },
        { question: "How many men did George Washington lead in 1754?", answer: "150 men" },
        { question: "What Native American groups allied with the French at Fort Duquesne?", answer: "Shawnee and Delaware" },
        { question: "What did Washington's men name their makeshift camp?", answer: "Fort Necessity" },
        { question: "Why was Fort Necessity's location a mistake?", answer: "It was low ground where rain collected, soaking the men, their guns, and gunpowder." },
        { question: "What could have happened to Washington's career after he resigned from the Virginia militia?", answer: "That could have been the end of his military career." },
      ]},
      { title: "Ch. 5: French & Indian War", questions: [
        { question: "What was the name of the war that began with Washington's battle against the French?", answer: "The French and Indian War" },
        { question: "What was this war called in Europe and Asia?", answer: "The Seven Years' War" },
        { question: "Who was the British general sent to take Fort Duquesne in 1755?", answer: "General Edward Braddock" },
        { question: "What rank did General Braddock give George Washington?", answer: "Colonel" },
        { question: "Why did Braddock's red coats make his soldiers easy targets in the woods?", answer: "French soldiers and Native American allies fired from hiding places in the thick woods." },
        { question: "Who became British prime minister and turned the tide of the war?", answer: "William Pitt" },
        { question: "What two rivers did William Pitt want to control to cut off French supplies?", answer: "The St. Lawrence River and the Niagara River" },
        { question: "What new name was given to Fort Duquesne after the British captured it?", answer: "Fort Pitt" },
        { question: "What major French city did General James Wolfe capture by climbing steep cliffs?", answer: "Quebec" },
        { question: "What peace treaty ended the French and Indian War in 1763?", answer: "The Treaty of Paris" },
      ]},
      { title: "Ch. 6: Quarrel with Britain", questions: [
        { question: "What conflict broke out between Native Americans, settlers, and British soldiers in the Great Lakes area?", answer: "Pontiac's War" },
        { question: "What line did King George III draw with his 1763 proclamation?", answer: "A line along the Appalachian Mountains from New York south to Georgia" },
        { question: "What was the purpose of the Proclamation of 1763?", answer: "To keep colonists away from Native American lands to prevent a new war" },
        { question: "Why were British soldiers kept along the frontier after the war?", answer: "To enforce the proclamation" },
        { question: "Why did Parliament believe colonists should help pay for the French and Indian War?", answer: "Britain spent a lot of money to win the war and colonists had benefited from Britain's victory." },
        { question: "What practice did colonists use to avoid paying taxes on imported goods?", answer: "Smuggling" },
        { question: "What new taxes were British officials especially focused on?", answer: "New taxes on sugar and molasses" },
        { question: "What right did Britain violate by searching homes for smuggled goods?", answer: "The right that government officers could not search a home or business whenever they felt like it" },
        { question: "What act required colonial governments to house British soldiers?", answer: "The Quartering Act" },
        { question: "What did colonists wonder about British soldiers staying in the colonies?", answer: "Were the soldiers staying to make sure colonists obeyed British laws, even the unfair ones?" },
      ]},
      { title: "Ch. 7: Stamp Act Crisis", questions: [
        { question: "What act passed in 1765 taxed almost every kind of printed paper?", answer: "The Stamp Act" },
        { question: "How many different items did the Stamp Act apply to?", answer: "About fifty" },
        { question: "What was the main reason colonists were angry about the Stamp Act?", answer: "They had no voice and no representatives in Parliament, which passed the tax law." },
        { question: "What phrase did colonists use to oppose the Stamp Act?", answer: "\"Taxation without representation\"" },
        { question: "Who was the twenty-nine-year-old Virginian who powerfully protested the Stamp Act?", answer: "Patrick Henry" },
        { question: "What was the name of the Virginia assembly where Patrick Henry spoke?", answer: "The Virginia House of Burgesses" },
        { question: "What groups formed to threaten stamp tax collectors?", answer: "Sons of Liberty" },
        { question: "What organized protest did the Sons of Liberty launch against British goods?", answer: "A boycott" },
        { question: "What women's groups helped support the boycott by weaving their own cloth?", answer: "Daughters of Liberty" },
        { question: "In what year did Parliament repeal the Stamp Act?", answer: "1766" },
      ]},
    ]
  });
});

router.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Critical for refresh token
    scope: [
      'https://www.googleapis.com/auth/forms.body',
      'https://www.googleapis.com/auth/drive.file'
    ],
    prompt: 'consent' // Force prompts to ensure we get a refresh token
  });
  res.redirect(url);
});

router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log('✅ REFRESH TOKEN RECEIVED:', tokens.refresh_token);

    res.send(`
      <h1>Authentication Successful</h1>
      <p>Please add the following to your <code>server/.env</code> file:</p>
      <pre>GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
      <p>After adding it, restart your server.</p>
    `);
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Authentication failed');
  }
});

router.post('/create-form-from-json', async (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'filename is required' });
  }

  // Restrict to the output directory to prevent path traversal
  const outputDir = 'output';
  const filePath = `${outputDir}/${filename}`;

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `File not found: ${filename}` });
    }

    const quizJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const formUrl = await createGoogleForm(quizJson);
    console.log('Google Form created from JSON:', formUrl);
    res.json({ success: true, formUrl });
  } catch (error) {
    console.error('Error creating form from JSON:', error);
    res.status(500).json({ error: toClientError(error, 'Failed to create Google Form') });
  }
});

router.post('/generate-quiz', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { prompt } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let content = '';

    if (file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      content = data.text;
    } else {
      content = fs.readFileSync(file.path, 'utf-8');
    }

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    // 1. Generate Quiz JSON
    const quizJson = await generateQuiz(content, prompt);
    console.log('Quiz JSON generated successfully');

    // Save JSON to file
    try {
      const outputDir = 'output';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeTitle = (quizJson.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${outputDir}/${safeTitle}_${timestamp}.json`;

      fs.writeFileSync(filename, JSON.stringify(quizJson, null, 2));
      console.log(`Quiz JSON saved to ${filename}`);
    } catch (fsError) {
      console.error('Failed to save JSON file:', fsError);
      // Don't block the response, just log the error
    }

    // 2. Create Google Form
    const formUrl = await createGoogleForm(quizJson);
    console.log('Google Form created:', formUrl);

    res.json({ success: true, formUrl });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: toClientError(error, 'Failed to generate quiz') });
  }
});

export default router;
