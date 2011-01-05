class SessionsController < ApplicationController
  
  
  def new
  	@title = "Sign in"

	#FACEBOOK LOGIN ANDRE
	#def facebook_login
	
		if(session[:fb_id])
			redirect_to current_user
		end
		
		#query all users
		@users = User.all
		
		#create OAuth helper
		@oauth = Koala::Facebook::OAuth.new("115861615151381", '35aba13c7b790d4e41f38feccacbe04a', "http://blaichinger2.heroku.com/")
		
		if session[:fb_id]
			@user = User.find_by_fbid(session[:fb_id])
		end
		
		#if authorization code exists, get access token
		if params[:code] && !session[:token]
			@code = params[:code]
			#request and parse token from facebook
			@token = Koala::Facebook::OAuth.new("115861615151381", '35aba13c7b790d4e41f38feccacbe04a', "http://blaichinger2.heroku.com/").get_access_token(@code)
			
			#establish graph API connection
			@graph = Koala::Facebook::GraphAPI.new(@token)
			
			#query user data from fb
			@me = @graph.get_object("me")
			
			if User.find_by_mail(@me['email'])
				session[:fb_id] = @me['id']
				session[:token] = @token
				@user = User.find_by_mail(@me['email'])
				flash.now[:notice] = "user already member. IMPLEMENT login!"
			else
				# creates new user
				# ERROR: cant find :fbid o.O
				@user = User.new(:fbid => @me['id'], :name => @me['name'], :mail => @me['email'])
				#@user.save
				if @user.save
					session[:fb_id] = @user.fbid
					session[:token] = @token
					flash.now[:success] = "user saved!"
					#redirect_to :action => 'start'
				else
					# unexpected error occured, save failed
					flash.now[:error] = "User save failed due to wrong data"
				end
			end
		end
		if(session[:fb_id])
			redirect_to current_user
		else
			#redirect_to root_path, :layout => false
		end

end
 
 
 
  def create
	  user = User.authenticate(params[:session][:email], params[:session][:password])
	  
	  if user.nil?
		flash.now[:error] = "Invalid email/password combination."
		@title = "Sign in"
		render 'new'
	  else
		 sign_in(user)
      	 redirect_to user
	  end

  end
  
  
  def destroy
    sign_out
    redirect_to signin_path
  end


end
