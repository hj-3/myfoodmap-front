# 나만의 맛집 기록 서비스 MyFoodMap
## 1. 프로젝트 개요
**기획 배경**
  - 많은 사람들이 점심시간마다 메뉴를 선택하는데 어려움을 겪고, 맛있게 먹었던 식당을 잊어버리거나 메모해둔 맛집을 찾지 못하는 불편함 느꼈던 경험이 있을 것이다.
  - 이러한 불편함과 시간 소요를 줄이기위해, 지도 기반의 개인화된 푸드 다이어리를 기획했다.

**팀원**
  - 김승완, 김형준, 최재우
  
## 2. 기술  스택
**Frontend**
  - **Languege**: Javascript, HTML5, CSS3
  - **Library & Framework**: React, Vite
  - **CI/CD**: Github Actions, Amazon S3, AWS CloudFront

**Backend**
  - **Library & Framework**: Node.js, Express.js
  - **Database**: MySQL, Prisma(ORM)
  - **CI/CD**: Github Actions, Amazon S3, AWS CodeDeploy

**Collaboration**
  - Github, Slack, Notion

## 3. 시스템 아키텍처
<img width="3260" height="1670" alt="Image" src="https://github.com/user-attachments/assets/46e836f0-4dcd-4430-b914-7ca4c9ba42e5" />

## 4. ERD
<img width="2727" height="1140" alt="Image" src="https://github.com/user-attachments/assets/f3f2dee6-fc8e-45b9-9aad-8993e45bbaf3" />

## 5. API 명세
<img width="3539" height="1256" alt="Image" src="https://github.com/user-attachments/assets/a7d205bb-e0ae-42c5-90f1-523fcc1ea014" />

## 6. 주요 기능
**[회원가입/로그인]**
  - 아이디, 닉네임, 비밀번호를 입력하여 회원가입
  - JWT 인증 방식을 통한 로그인 방식 구현

**[검색]**
  - "지역 + 메뉴" 키워트를 통해 음식점 검색
  - 검색 결과는 빨간 마커로 표시
  - KakaoMap API를 통해 지도, 지도 검색 구현
  - 식당을 선택하면 식당에 대한 간단한 정보와 상세 정보로 이어지는 버튼, 리뷰 버튼 출력

**[리뷰 작성]**
  - 방문일자, 이미지, 평점, 메뉴명, 가격, 리뷰 입력
  - 이미지를 제외한 항목은 필수
  - 리뷰를 작성한 식당은 지도에 노란 별 마커로 표시

**[리뷰 조회]**
  - 기본적으로 모든 기간의 리뷰 조회
  - 기간 별 조회 가능
  - 기간 내 통계 정보 요약 (리뷰 수, 방문 식당 수, 총 지출, 평균 평점)
  - 리뷰 정렬 기능 (최신순, 가격순, 평점순)
  - 리뷰 목록에서 리뷰 선택하면 리뷰 상세로 이동

**[리뷰 수정]**

**[리뷰 삭제]**

## 7. 주요 페이지
<img width="200" height="350" alt="Image" src="https://github.com/user-attachments/assets/f28c2eae-6bc0-4de8-b2fd-73f3932b77d3" />  
<img width="200" height="350" alt="Image" src="https://github.com/user-attachments/assets/905c4395-68f0-4d62-98c6-e0756a1c6bd6" />  
<img width="250" height="350" alt="Image" src="https://github.com/user-attachments/assets/e9ef4e9b-0340-4d5f-8579-98449e28e017" />  
<img width="250" height="350" alt="Image" src="https://github.com/user-attachments/assets/a131ba80-2019-464e-be95-47b4f5f75863" />  
<img width="250" height="350" alt="Image" src="https://github.com/user-attachments/assets/f9132509-bbad-450e-9b92-501510c48eaf" />  
<img width="250" height="350" alt="Image" src="https://github.com/user-attachments/assets/9dbbd5d4-c85d-4013-af58-77e1de4beb2b" />  
<img width="250" height="350" alt="Image" src="https://github.com/user-attachments/assets/a5b87bc0-759c-45df-a72d-9728348d69c0" />  
<img width="250" height="350" alt="Image" src="https://github.com/user-attachments/assets/c7b79c9a-6280-48aa-a465-e79fc56d4234" />
