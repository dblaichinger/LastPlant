class SessionsController < ApplicationController
  
  
  def new
  	@title = "Sign in"
	
	
	#FACEBOOK LOGIN ANDRE
	#def facebook_login
		establish_oauth
		
	
		if(session[:fb_id])
			#@user = User.find_by_fbid(session[:fb_id])
			redirect_to home_path
			return
		end
		
		#create OAuth helper
		
			
		#if authorization code exists, get access token
		if params[:code]
			@code = params[:code]
			#request and parse token from facebook
			@token = Koala::Facebook::OAuth.new("115861615151381", '35aba13c7b790d4e41f38feccacbe04a', "http://blaichinger2.heroku.com/").get_access_token(@code)
			
			#establish graph API connection
			establish_graph
			
			#query user data from fb
			@me = @graph.get_object("me")
			
			if User.find_by_fbid(@me['id'])
				session[:fb_id] = @me['id']
				session[:name] = @me['name']
				@user = User.find_by_fbid(@me['id'])
				flash.now[:notice] = "user logged in."
			else
				# creates new user
				@user = User.new(:fbid => @me['id'], :name => @me['name'], :email => @me['email'], :isFacebook => true)
				if @user.save
					session[:fb_id] = @user.fbid
					session[:name] = @user.name
					flash.now[:success] = "user saved!"
				else
					# unexpected error occured, save failed
					flash.now[:error] = "User save failed due to wrong data"
				end
			end
		end
		if(session[:fb_id])
			@user = User.find_by_fbid(session[:fb_id])
			redirect_to home_path
			return
		else
			#flash.now[:error] = "Error: Login failed"
			#render :action => 'new'
		end

end
 
 
 
  def create
	  user = User.authenticate(params[:session][:email], params[:session][:password])
	  
	  if user.nil?
		flash.now[:error] = "Invalid email/password combination."
		@title = "Sign in"
		render 'new'
	  else
		 sign_in user
      	 redirect_to user
	  end

  end
  
  
  def destroy
    sign_out
    redirect_to root_path
  end


end
