
import curl from 'curl'; 
import _ from 'lodash';
const memoizedFetchData = _.memoize(async (req, res, next) => {

    
    const header = req?.headers['x-hasura-admin-secret'];
    return new Promise((resolve, reject) => {
        curl.get('https://intent-kit-16.hasura.app/api/rest/blogs/', {
            headers: {
                'x-hasura-admin-secret': `${header}`,
            }
        }, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                try {
                    const responseBody = JSON.parse(body);

                    if (responseBody.error && responseBody.error.code === 'access-denied') {
                        res.status(403).json({ error: 'Access denied' });
                        reject('Access denied'); 
                    } else {
                        resolve(responseBody); 
                    }
                } catch (err) {
                    console.error(err);
                    reject(err); 
                }
            }
        });
    });
});

export const fetchData = async (req, res, next) => {
    try {
        const responseBody = await memoizedFetchData(req, res, next);
       
        const blogSize = _.size(responseBody.blogs);
        

        const blogWithLongestTitle = _.maxBy(responseBody.blogs, blog => _.size(blog.title));
        
        const blogsWithPrivacy = _.filter(responseBody.blogs, blog => _.includes(blog.title.toLowerCase(), 'privacy'));
        const numberOfBlogsWithPrivacy = _.size(blogsWithPrivacy);
    
        const uniqueBlogTitles = _.uniqBy(responseBody.blogs, 'title').map(blog => blog.title);
        const uniqueBlogTitlesSize = _.size(uniqueBlogTitles);
        const answer = {blogSize, blogWithLongestTitle, numberOfBlogsWithPrivacy,uniqueBlogTitlesSize };
        res.status(200).json(answer);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const searchData = async (req, res , next) => {
   const {blogs} = await memoizedFetchData(req,res , next);
   const { query } = req.query;
  
    try {
       
        const blog = blogs?.filter((blog) => {
            return blog.title.toLowerCase().includes(query.toLowerCase());
        }) 
        res.status(200).json({blog:blog});
    } catch (error) {
        console.log(error);
    }

}

