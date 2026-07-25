import React from 'react';
import {
  Card, CardActions, CardContent, CardMedia,
  Button, Typography, Chip, Tooltip,
} from '@material-ui/core';
import ThumbUpAltIcon    from '@material-ui/icons/ThumbUpAlt';
import DeleteIcon        from '@material-ui/icons/Delete';
import MoreHorizIcon     from '@material-ui/icons/MoreHoriz';
import ImageIcon         from '@material-ui/icons/Image';
import moment            from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { deletePost, likePost } from '../../../actions/posts';
import Comments from '../../Comments/Comments';
import useStyles from './styles';

const Post = ({ post, setCurrentID }) => {
  const classes          = useStyles();
  const dispatch         = useDispatch();
  const { profile }      = useSelector((s) => s.auth);
  const isOwner          = profile && profile.sub === post.creator_sub;
  const displayImage     = post.thumbUrl || post.imageUrl;

  return (
    <Card className={classes.card} elevation={3}>
      {/* Image */}
      {displayImage ? (
        <CardMedia className={classes.media} image={displayImage} title={post.post_title} />
      ) : (
        <div className={classes.noImage}>
          <ImageIcon style={{ fontSize: 40, color: '#bbb' }} />
        </div>
      )}

      {/* S3 badge */}
      {post.imageUrl && (
        <Tooltip title="Image stored on AWS S3 · Thumbnail via Lambda">
          <Chip label="☁ S3" size="small"
            style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#FF9800', color: '#fff', fontWeight: 700 }} />
        </Tooltip>
      )}

      {/* Author + time overlay */}
      <div className={classes.overlay}>
        <Typography variant="subtitle2" style={{ fontWeight: 700 }}>{post.posted_by}</Typography>
        <Typography variant="caption">{moment(post.createdAt).fromNow()}</Typography>
      </div>

      {/* Edit button (owner only) */}
      {isOwner && (
        <div className={classes.overlay2}>
          <Button style={{ color: 'white' }} size="small" onClick={() => setCurrentID(post._id)}>
            <MoreHorizIcon fontSize="small" />
          </Button>
        </div>
      )}

      {/* Tags */}
      {post.post_tags?.length > 0 && (
        <div className={classes.details}>
          <Typography variant="body2" color="textSecondary">
            {post.post_tags.map((t) => `#${t}`).join(' ')}
          </Typography>
        </div>
      )}

      <Typography className={classes.title} variant="h6" gutterBottom>
        {post.post_title}
      </Typography>

      <CardContent style={{ paddingTop: 0 }}>
        <Typography variant="body2" color="textSecondary">{post.post_message}</Typography>
      </CardContent>

      <CardActions className={classes.cardActions}>
        <Button size="small" color="primary" onClick={() => dispatch(likePost(post._id))} disabled={!profile}>
          <ThumbUpAltIcon fontSize="small" /> &nbsp; {post.post_likes || 0}
        </Button>
        {isOwner && (
          <Button size="small" color="secondary" onClick={() => dispatch(deletePost(post._id))}>
            <DeleteIcon fontSize="small" /> Delete
          </Button>
        )}
      </CardActions>

      {/* Comments section */}
      <Comments postId={post._id} />
    </Card>
  );
};

export default Post;
