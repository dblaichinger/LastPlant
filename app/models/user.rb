# == Schema Information
# Schema version: 20110104150719
#
# Table name: users
#
#  id                 :integer         not null, primary key
#  name               :string(255)
#  email              :string(255)
#  created_at         :datetime
#  updated_at         :datetime
#  encrypted_password :string(255)
#  salt               :string(255)
#  admin              :boolean
#  fbid               :string(255)
#  createScore        :integer
#  destroyScore       :integer
#

class User < ActiveRecord::Base
	
	attr_accessor :password
	attr_accessible :name, :email, :password, :password_confirmation
	
	email_regex = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i


	
	validates :name, :presence => true, :length => {:maximum =>100}

	validates :email, :presence   => true,
                    :format     => { :with => email_regex },
                    :uniqueness => { :case_sensitive => false }


	  # Automatically create the virtual attribute 'password_confirmation'.
	 if(validates :isFacebook, :value => false)
	  validates  :password, :presence     => true,
	 					   :confirmation => true,
						   :length       => { :within => 6..40 }
	
	  end
						  

	 
	 #Calls method encrypt_password before saving to database
	 before_save :encrypt_password
	 
	 # Return true if the user's password matches the submitted password.
  	 def has_password?(submitted_password)
     # Compare encrypted_password with the encrypted version of submitted_password.
	 	encrypted_password == encrypt(submitted_password)
  	 end


	
	# Methods for authentication
	
	 def self.authenticate(email, submitted_password)
		user = find_by_email(email)
		
		if user.nil?
		  return nil
		elsif user.has_password?(submitted_password)
		  return user
		else
		  return nil
		end
	 end


	def self.authenticate_with_salt(id, cookie_salt)
	  user = find_by_id(id)
	  
	    if user.nil?
		  return nil
	 	elsif user.salt == cookie_salt
		  return user
		else
		  return nil
		end
	end


	  private
	
		def encrypt_password
		  self.salt = make_salt if new_record?
		  self.encrypted_password = encrypt(password)
		end
	
		def encrypt(string)
		  Digest::SHA2.hexdigest("#{salt}--#{string}")
		end
	
		def make_salt
		  Digest::SHA2.hexdigest("#{Time.now.utc}--#{password}")
		end

end

