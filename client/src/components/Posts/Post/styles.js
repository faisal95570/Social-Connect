import { makeStyles } from '@material-ui/core/styles';
export default makeStyles({
  card:       { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '10px', height: '100%', position: 'relative' },
  media:      { height: 200, objectFit: 'cover' },
  noImage:    { height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  overlay:    { position: 'absolute', top: '16px', right: '16px', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.7)' },
  overlay2:   { position: 'absolute', top: '16px', right: '90px' },
  details:    { display: 'flex', justifyContent: 'space-between', padding: '8px 16px' },
  title:      { padding: '0 16px' },
  cardActions:{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between' },
});
