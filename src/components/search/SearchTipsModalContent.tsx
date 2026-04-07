import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';

export default function SearchTipsModalContent() {
  return (
    <>
      <Box mb={1}>
        <Typography variant="body2" color="text.secondary">
          이 검색은 <b>단어(띄어쓰기 기준)</b>를 기준으로 동작합니다. 부분 글자(접두·접미)만으로는 매칭되지 않을 수
          있습니다.
        </Typography>
      </Box>
      <List dense>
        <ListItem>
          <ListItemText
            primary="단어 전체로 검색해 주세요"
            secondary={`예) "로그인"(○), "로그"(×) / "apple"(○), "a"(×)`}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="두 글자 이상을 권장합니다"
            secondary="한 글자 검색은 결과가 적거나 없을 수 있습니다."
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="제목/내용 범위를 선택해서 정밀 검색"
            secondary={`예) '제목' 또는 '내용' 선택 후 검색어 입력`}
          />
        </ListItem>
      </List>
      <Typography variant="caption" color="text.secondary">
        * GitHub 이슈 검색 특성상 부분 일치는 제한적입니다.
      </Typography>
    </>
  );
}
