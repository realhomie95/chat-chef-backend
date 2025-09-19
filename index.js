// 패키지 가져오기
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import * as dotenv from "dotenv";

const app = express();

// CLIENT_URL

const corsOption = {
  origin: "https://realhomie-chef-class.netlify.app",
  credentials: true,
};

// app.use(cors());
app.use(cors(corsOption));

// 프론트엔드에서 받은 json형태의 데이터를 자바스크립트 객체로 변경(파싱)해주는 코드
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// env 설정
dotenv.config(); //환경변수 로드

// openai 정보 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 챗봇 api설정
const initialMessage = (ingredientList) => {
  return [
    {
      role: "system",
      content: `당신은 "맛있는 쉐프"라는 이름의 전문 요리사입니다. 사용자가 재료 목록을 제공하면, 첫번째 답변에서는 오직 다음 문장만을 응답으로 제공해야 합니다. 다른 어떤 정보도 추가하지 마세요: 제공해주신 재료 목록을 보니 정말 맛있는 요리를 만들 수 있을 것 같아요. 어떤 종류의 요리를 선호하시나요? 간단한 한끼 식사, 특별한 저녁 메뉴, 아니면 가벼운 간식 등 구체적인 선호도가 있으시다면 말씀해 주세요. 그에 맞춰 최고의 레시피를 제안해 드리겠습니다!`,
    },
    {
      role: "user",
      content: `안녕하세요, 맛있는 쉐프님. 제가 가진 재료로 요리를 하고 싶은데 도와주실 수 있나요? 제 냉장고에 있는 재료들은 다음과 같아요: ${ingredientList
        .map((item) => item.value)
        .join(", ")}`,
    },
  ];
};

// 초기 답변
// create recipe
app.post("/recipe", async (req, res) => {
  const { ingredientList } = req.body; // 프론트엔드에서 재료 목록을 받음
  const messages = initialMessage(ingredientList);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 1,
      max_tokens: 4000,
      top_p: 1,
    });
    const data = [...messages, response.choices[0].message];
    res.json({ data });
  } catch (error) {
    console.log(error);
  }
});

// 유저와의 채팅
// create chat
app.post("/message", async (req, res) => {
  const { userMessage, messages } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [...messages, userMessage],
      temperature: 1,
      max_tokens: 4000,
      top_p: 1,
    });
    const data = response.choices[0].message;
    res.json({ data });
  } catch (error) {
    console.log(error);
  }
});

// 테스트용 api
// req: 프론트 -> 백엔드 [요청객체]
// res: 백엔드 -> 프론트 [응답객체]
// read test
app.get("/test", (req, res) => {
  // 이 api가 호출되었을 때 실행되는 로직
  // try-catch문 : 에러가 발생할 수 있는 코드를 안전하게 실행하기 위해 사용하는 구문
  try {
    // 정상적으로 실행되는 코드(프론트 엔드에게 응답)
    res.json({ data: "test" });
  } catch (error) {
    // 에러가 발생했을 때 실행되는 코드
    console.error("Error occurred:", error);
  }
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

// react : 3000번 포트
// express : 8080번 포트
// url : localhost:8080
