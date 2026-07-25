import { makeStyles } from '@material-ui/core/styles';
export default makeStyles(() => ({
  appBar:          { borderRadius: 0, margin: '0 0 10px 0', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px' },
  heading:         { color: '#3f51b5', fontWeight: 700, textDecoration: 'none' },
  brandContainer:  { display: 'flex', alignItems: 'center' },
  toolbar:         { display: 'flex', justifyContent: 'flex-end', width: '400px', gap: '12px' },
  profile:         { display: 'flex', justifyContent: 'space-between', width: '340px', alignItems: 'center', gap: 10 },
  logout:          { marginLeft: '20px' },
  userName:        { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 },
  purple:          { color: '#fff', backgroundColor: '#3f51b5', width: 36, height: 36 },
}));
